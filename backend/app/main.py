from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from fastapi.security import OAuth2PasswordRequestForm
from thefuzz import process
from datetime import date, timedelta

from . import models, schemas, database, pdf_extractor, auth

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="College Credit Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Must be False when allow_origins=["*"] to prevent browser CORS block
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to College Credit Tracker API"}

@app.post("/api/auth/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/extract/curriculum")
async def extract_curriculum(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user)):
    temp_file = f"/tmp/temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        data = pdf_extractor.extract_curriculum_from_pdf(temp_file)
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)
    return data

@app.post("/api/extract/online-curriculum")
async def extract_online_curriculum(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user)):
    temp_file = f"/tmp/temp_online_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        courses = pdf_extractor.extract_online_curriculum_from_pdf(temp_file)
        data = {
            "department": "Online",
            "program": "Approved Courses",
            "regulation": "N/A",
            "total_required_credits": 0,
            "pages_analysed": 1,
            "last_page_analysed": True,
            "categories": [
                {
                    "name": "Open Electives",
                    "required_credits": 0,
                    "courses": courses
                }
            ]
        }
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)
    return data

@app.post("/api/extract/open-elective")
async def extract_open_elective(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user)):
    temp_file = f"/tmp/temp_oe_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        courses = pdf_extractor.extract_special_curriculum_from_pdf(temp_file)
        data = {
            "department": "Open Elective",
            "program": "Approved Courses",
            "regulation": "N/A",
            "total_required_credits": 0,
            "pages_analysed": 1,
            "last_page_analysed": True,
            "categories": [
                {
                    "name": "Open Electives",
                    "required_credits": 0,
                    "courses": courses
                }
            ]
        }
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)
    return data

@app.post("/api/extract/minor-course")
async def extract_minor_course(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user)):
    temp_file = f"/tmp/temp_minor_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        courses = pdf_extractor.extract_special_curriculum_from_pdf(temp_file)
        data = {
            "department": "Minor Degree",
            "program": "Approved Courses",
            "regulation": "N/A",
            "total_required_credits": 0,
            "pages_analysed": 1,
            "last_page_analysed": True,
            "categories": [
                {
                    "name": "Minor Courses",
                    "required_credits": 0,
                    "courses": courses
                }
            ]
        }
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)
    return data

def save_special_curriculum(courses: List[schemas.CurriculumCourseCreate], category_name: str, category_desc: str, db: Session, current_user: models.User):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student or not student.curriculum_id:
        raise HTTPException(status_code=404, detail="Student or Curriculum not found")

    if "Open" in category_name:
        search_term = "%Open Elective%"
    elif "Minor" in category_name:
        search_term = "%Minor%"
    else:
        search_term = f"%{category_name}%"

    category = db.query(models.CurriculumCategory).filter(
        models.CurriculumCategory.curriculum_id == student.curriculum_id,
        models.CurriculumCategory.name.ilike(search_term)
    ).first()

    if not category:
        category = models.CurriculumCategory(
            curriculum_id=student.curriculum_id,
            name=category_name,
            required_credits=12 if "Open" in category_name else 18,
            minimum_courses=None,
            maximum_courses=None,
            description=category_desc
        )
        db.add(category)
        db.commit()
        db.refresh(category)

    for course_data in courses:
        existing = db.query(models.CurriculumCourse).filter(
            models.CurriculumCourse.curriculum_id == student.curriculum_id,
            models.CurriculumCourse.course_code == course_data.course_code
        ).first()
        if not existing:
            db_course = models.CurriculumCourse(
                curriculum_id=student.curriculum_id,
                category_id=category.id,
                course_code=course_data.course_code,
                course_name=course_data.course_name,
                credits=course_data.credits,
                mandatory=course_data.mandatory,
                elective=course_data.elective,
                prerequisites=course_data.prerequisites
            )
            db.add(db_course)
    db.commit()
    return {"message": f"{category_name} saved successfully"}

@app.post("/api/curriculums/online")
def create_online_curriculum(courses: List[schemas.CurriculumCourseCreate], db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return save_special_curriculum(courses, "Open Electives", "Online and Open Elective Courses", db, current_user)

@app.post("/api/curriculums/open-elective")
def create_open_elective(courses: List[schemas.CurriculumCourseCreate], db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return save_special_curriculum(courses, "Open Electives", "Open Elective Courses", db, current_user)

@app.post("/api/curriculums/minor-course")
def create_minor_course(courses: List[schemas.CurriculumCourseCreate], db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return save_special_curriculum(courses, "Minor Courses", "Minor Degree Courses", db, current_user)

@app.post("/api/extract/result")
async def extract_result(file: UploadFile = File(...), db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    temp_file = f"/tmp/temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        raw_results = pdf_extractor.extract_result_from_pdf(temp_file)
        
        curriculum_courses = db.query(models.CurriculumCourse).filter(models.CurriculumCourse.curriculum_id == student.curriculum_id).all()
        curr_course_dicts = [{"id": s.id, "code": s.course_code, "name": s.course_name, "category_id": s.category_id, "credits": s.credits} for s in curriculum_courses]
        
        mandatory_category = db.query(models.CurriculumCategory).filter(
            models.CurriculumCategory.curriculum_id == student.curriculum_id,
            models.CurriculumCategory.name.ilike("%Mandatory%")
        ).first()

        others_category = db.query(models.CurriculumCategory).filter(
            models.CurriculumCategory.curriculum_id == student.curriculum_id,
            models.CurriculumCategory.name.ilike("%Others%")
        ).first()

        oe_category = db.query(models.CurriculumCategory).filter(
            models.CurriculumCategory.curriculum_id == student.curriculum_id,
            models.CurriculumCategory.name.ilike("%Open Elective%")
        ).first()

        minor_category = db.query(models.CurriculumCategory).filter(
            models.CurriculumCategory.curriculum_id == student.curriculum_id,
            models.CurriculumCategory.name.ilike("%Minor%")
        ).first()

        mapped_results = []
        for raw in raw_results:
            matched, confidence, possible_matches = pdf_extractor.fuzzy_match_subject(raw["raw_name"], raw["raw_code"], curr_course_dicts)
            
            match_type = models.MatchType.NONE
            review_status = models.ReviewStatus.REVIEW_REQUIRED
            matched_category_id = matched["category_id"] if matched else None
            
            if confidence >= 95:
                match_type = models.MatchType.EXACT
                review_status = models.ReviewStatus.ACCEPTED
            elif confidence >= 70:
                match_type = models.MatchType.POSSIBLE_MATCH

            # Auto-map training/internship courses to Others category
            raw_name_lower = raw["raw_name"].lower()
            raw_credits = raw.get("credits", 0)

            _is_training_course = any(kw in raw_name_lower for kw in [
                "implant", "inplant", "in-plant", "in plant",
                "internship", "industrial training",
                "vocational training", "industry training",
                "training",
            ])

            _is_mandatory_by_name = any(kw in raw_name_lower for kw in [
                "environmental science", "constitution of india", 
                "national service scheme", "national sports organization",
                "youth red cross", "nss", "nso", "yrc"
            ])
            _is_mandatory_by_code = "mc" in raw["raw_code"].lower()

            if _is_training_course:
                if not others_category:
                    others_category = models.CurriculumCategory(
                        curriculum_id=student.curriculum_id,
                        name="Others",
                        required_credits=0,
                        description="Auto-generated category for internships and other courses"
                    )
                    db.add(others_category)
                    db.commit()
                    db.refresh(others_category)
                    
                if review_status != models.ReviewStatus.ACCEPTED:
                    match_type = models.MatchType.MANUAL
                    review_status = models.ReviewStatus.ACCEPTED
                matched_category_id = others_category.id
            
            # Auto-map 0-credit courses or known mandatory courses to Mandatory category
            elif raw_credits == 0 or _is_mandatory_by_name or _is_mandatory_by_code:
                if not mandatory_category:
                    mandatory_category = models.CurriculumCategory(
                        curriculum_id=student.curriculum_id,
                        name="Mandatory Courses",
                        required_credits=0,
                        description="Auto-generated category for non-credit mandatory courses"
                    )
                    db.add(mandatory_category)
                    db.commit()
                    db.refresh(mandatory_category)
                    
                if review_status != models.ReviewStatus.ACCEPTED:
                    match_type = models.MatchType.MANUAL
                    review_status = models.ReviewStatus.ACCEPTED
                # Always force the category to mandatory for these
                matched_category_id = mandatory_category.id
                raw_credits = 0 # Force 0 credits for known mandatory courses
                
            elif matched_category_id is None:
                # Predictive fallback based on code pattern
                code_upper = raw["raw_code"].upper()
                if code_upper.startswith("O") and len(code_upper) >= 6:
                    if not oe_category:
                        oe_category = models.CurriculumCategory(
                            curriculum_id=student.curriculum_id,
                            name="Open Electives",
                            required_credits=12,
                            description="Auto-generated category for Open Electives"
                        )
                        db.add(oe_category)
                        db.commit()
                        db.refresh(oe_category)
                    
                    matched_category_id = oe_category.id
                    match_type = models.MatchType.MANUAL
                    review_status = models.ReviewStatus.ACCEPTED
                elif code_upper.startswith("M") and len(code_upper) >= 6 and not _is_mandatory_by_code:
                    if not minor_category:
                        minor_category = models.CurriculumCategory(
                            curriculum_id=student.curriculum_id,
                            name="Minor Courses",
                            required_credits=18,
                            description="Auto-generated category for Minor Courses"
                        )
                        db.add(minor_category)
                        db.commit()
                        db.refresh(minor_category)
                        
                    matched_category_id = minor_category.id
                    match_type = models.MatchType.MANUAL
                    review_status = models.ReviewStatus.ACCEPTED

            mapped_results.append({
                "course_code": raw["raw_code"],
                "course_name": raw["raw_name"],
                "credits": matched["credits"] if matched else raw_credits,
                "grade": raw["grade"],
                "is_passed": raw["is_passed"],
                "match": {
                    "match_type": match_type,
                    "confidence": confidence,
                    "review_status": review_status,
                    "curriculum_course_id": matched["id"] if matched else None,
                    "category_id": matched_category_id,
                    "possible_matches": possible_matches
                }
            })
        return mapped_results
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

@app.post("/api/curriculums", response_model=schemas.Curriculum)
def create_curriculum(curriculum: schemas.CurriculumCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_curriculum = models.Curriculum(
        department=curriculum.department,
        program=curriculum.program,
        regulation=curriculum.regulation,
        total_required_credits=curriculum.total_required_credits,
        pages_analysed=curriculum.pages_analysed,
        last_page_analysed=curriculum.last_page_analysed
    )
    db.add(db_curriculum)
    db.commit()
    db.refresh(db_curriculum)

    for cat_data in curriculum.categories:
        db_category = models.CurriculumCategory(
            curriculum_id=db_curriculum.id,
            name=cat_data.name,
            required_credits=cat_data.required_credits,
            minimum_courses=cat_data.minimum_courses,
            maximum_courses=cat_data.maximum_courses,
            description=cat_data.description
        )
        db.add(db_category)
        db.commit()
        db.refresh(db_category)

        for sub_data in cat_data.courses:
            db_subject = models.CurriculumCourse(
                curriculum_id=db_curriculum.id,
                category_id=db_category.id,
                course_code=sub_data.course_code,
                course_name=sub_data.course_name,
                credits=sub_data.credits,
                mandatory=sub_data.mandatory,
                elective=sub_data.elective,
                prerequisites=sub_data.prerequisites
            )
            db.add(db_subject)
        db.commit()

    db.refresh(db_curriculum)
    return db_curriculum

@app.get("/api/curriculums", response_model=List[schemas.Curriculum])
def get_curriculums(skip: int = 0, limit: int = 10, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Curriculum).offset(skip).limit(limit).all()

@app.post("/api/students")
def create_student(name: str, curriculum_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if db_student:
        db_student.curriculum_id = curriculum_id
        db_student.name = name
    else:
        db_student = models.Student(name=name, curriculum_id=curriculum_id, user_id=current_user.id)
        db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@app.post("/api/results")
def create_result(results: List[schemas.StudentCourseCreate], db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    for res_data in results:
        existing = db.query(models.StudentCourse).filter(
            models.StudentCourse.student_id == student.id,
            models.StudentCourse.course_code == res_data.course_code,
            models.StudentCourse.semester == res_data.semester
        ).first()
        
        if existing:
            continue
            
        db_course = models.StudentCourse(
            student_id=student.id,
            course_code=res_data.course_code,
            course_name=res_data.course_name,
            credits=res_data.credits,
            grade=res_data.grade,
            semester=res_data.semester,
            is_passed=res_data.is_passed,
            upload_date=date.today()
        )
        db.add(db_course)
        db.commit()
        db.refresh(db_course)
        
        for match_data in res_data.matches:
            db_match = models.CourseMatch(
                student_course_id=db_course.id,
                curriculum_course_id=match_data.curriculum_course_id,
                category_id=match_data.category_id,
                match_type=match_data.match_type,
                confidence=match_data.confidence,
                credits_counted=match_data.credits_counted,
                review_status=match_data.review_status
            )
            db.add(db_match)
        db.commit()

    return {"message": "Results saved successfully"}

@app.post("/api/matches/resolve")
def resolve_match(match_id: int, category_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Resolves a REVIEW_REQUIRED match to ACCEPTED with a specific category
    match = db.query(models.CourseMatch).filter(models.CourseMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    match.category_id = category_id
    match.review_status = models.ReviewStatus.ACCEPTED
    match.match_type = models.MatchType.MANUAL
    
    # Calculate credits to count
    student_course = db.query(models.StudentCourse).filter(models.StudentCourse.id == match.student_course_id).first()
    if student_course and student_course.is_passed:
        match.credits_counted = student_course.credits
        
    db.commit()
    return {"message": "Match resolved successfully"}

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    curriculum = db.query(models.Curriculum).filter(models.Curriculum.id == student.curriculum_id).first()
    if not curriculum:
        return None
    
    category_stats = {}
    for category in curriculum.categories:
        category_stats[category.id] = {
            "id": category.id,
            "name": category.name,
            "required_credits": category.required_credits,
            "completed_credits": 0,
            "failed_credits": 0,
            "extra_credits": 0,
            "is_satisfied": False,
            "completed_courses": [],
            "failed_courses": []
        }
        
    completed_credits = 0
    failed_credits = 0
    
    student_courses = db.query(models.StudentCourse).filter(models.StudentCourse.student_id == student.id).all()
    
    for course in student_courses:
        # Only count accepted matches to prevent double counting
        accepted_matches = [m for m in course.matches if m.review_status == models.ReviewStatus.ACCEPTED]
        
        course_entry = {
            "code": course.course_code,
            "name": course.course_name,
            "credits": course.credits,
            "grade": course.grade,
            "semester": course.semester,
            "is_passed": course.is_passed
        }
        
        if course.is_passed:
            if accepted_matches:
                # Count for category
                cat_id = accepted_matches[0].category_id
                if cat_id in category_stats:
                    category_stats[cat_id]["completed_credits"] += course.credits
                    category_stats[cat_id]["completed_courses"].append(course_entry)
                completed_credits += course.credits
        else:
            failed_credits += course.credits
            if accepted_matches:
                cat_id = accepted_matches[0].category_id
                if cat_id in category_stats:
                    category_stats[cat_id]["failed_courses"].append(course_entry)

    all_categories_satisfied = True
    for cat_id, stat in category_stats.items():
        if stat["completed_credits"] >= stat["required_credits"]:
            stat["is_satisfied"] = True
            if stat["completed_credits"] > stat["required_credits"]:
                stat["extra_credits"] = stat["completed_credits"] - stat["required_credits"]
                stat["completed_credits"] = stat["required_credits"] # Cap logic
        else:
            all_categories_satisfied = False

    return {
        "total_required_credits": curriculum.total_required_credits,
        "completed_credits": completed_credits,
        "remaining_credits": max(0, curriculum.total_required_credits - completed_credits),
        "failed_credits": failed_credits,
        "categories": list(category_stats.values()),
        "graduation_status": "Complete" if all_categories_satisfied and completed_credits >= curriculum.total_required_credits else "Incomplete"
    }

@app.get("/api/dashboard/semesters")
def get_dashboard_semesters(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    student_courses = db.query(models.StudentCourse).filter(models.StudentCourse.student_id == student.id).order_by(models.StudentCourse.id).all()
    
    GRADE_POINTS = {'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'U': 0}
    
    # Group by semester
    semesters = {}
    
    for course in student_courses:
        sem_name = course.semester or "Unknown"
        if sem_name not in semesters:
            semesters[sem_name] = []
        semesters[sem_name].append(course)
        
    import re
    def extract_sem_num(s):
        m = re.search(r'\d+', s)
        return int(m.group()) if m else 999

    semester_order = sorted(list(semesters.keys()), key=extract_sem_num)
    
    result = []
    cum_credits = 0
    cum_points = 0
    has_history_arrear = False
    
    for sem_name in semester_order:
        courses = semesters[sem_name]
        sem_credits = 0
        sem_points = 0
        sem_has_arrear = False
        
        sem_course_details = []
        
        for c in courses:
            if not c.is_passed:
                sem_has_arrear = True
                has_history_arrear = True
            
            course_detail = {
                "course_code": c.course_code,
                "course_name": c.course_name,
                "credits": c.credits,
                "grade": c.grade,
                "is_passed": c.is_passed,
                "grade_point": 0,
                "earned_points": 0,
                "included_in_gpa": False
            }
            
            # Pass grades that don't affect GPA (e.g., 'PASS') are skipped for GPA calculation
            # but their credits are counted for category completion. We only sum grade points for recognized grades.
            if c.grade and c.grade.upper() in GRADE_POINTS and c.is_passed:
                if c.credits > 0:
                    points = GRADE_POINTS[c.grade.upper()]
                    sem_credits += c.credits
                    sem_points += points * c.credits
                    
                    cum_credits += c.credits
                    cum_points += points * c.credits
                    
                    course_detail["grade_point"] = points
                    course_detail["earned_points"] = points * c.credits
                    course_detail["included_in_gpa"] = True
                    
            sem_course_details.append(course_detail)
                
        gpa = None
        if sem_credits > 0:
            gpa = round(sem_points / sem_credits, 2)
            
        cgpa = None
        if cum_credits > 0:
            cgpa = round(cum_points / cum_credits, 2)
            
        result.append({
            "semester": sem_name,
            "gpa": gpa,
            "cgpa": cgpa,
            "status": "Arrears" if sem_has_arrear else "All Clear",
            "courses_count": len(courses),
            "sem_credits": sem_credits,
            "sem_points": sem_points,
            "cum_credits": cum_credits,
            "cum_points": cum_points,
            "course_details": sem_course_details
        })
        
    return result

@app.delete("/api/student/reset")
def reset_student_data(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if student:
        db.delete(student)
        db.commit()
    return {"message": "All student data has been reset"}

# --- CHATBOT ---

TRAINING_DATA = {
    "what is credit tracker, what does this app do, how to use it": 
        "Credit Tracker helps you analyze and track your academic progress! First, you upload your department's curriculum PDF. Then, you upload your semester results. We automatically match your subjects to the curriculum and calculate your GPA and CGPA.",
        
    "how to upload curriculum, upload syllabus, where is curriculum": 
        "You can upload your curriculum PDF by clicking the 'Upload Curriculum to Start' button on the main dashboard, or by navigating to the Curriculum tab and finding the upload option.",
        
    "how to upload result, upload grades, upload marks": 
        "To upload a semester result, look for the 'Upload Semester Result' button on the dashboard. Make sure you upload a valid PDF of your results.",
        
    "how is cgpa calculated, how is gpa calculated, gpa formula, cgpa formula": 
        "Your GPA is calculated by taking the sum of (Credit × Grade Point) for all passed subjects in a semester, divided by the total credits. Your CGPA is the same calculation across all semesters combined.",
        
    "what happens if i have an arrear, failed subject, fail grade, arrears": 
        "If you have an arrear or fail a subject, that subject is NOT included in your GPA or CGPA calculations until you pass it. It will be flagged in your dashboard for your reference.",
        
    "what happens to 0 credit subjects, zero credits, 0 credits": 
        "Subjects with 0 credits are recorded in your transcript but do not affect your GPA or CGPA calculation at all, as they carry no credit weight.",
        
    "how to reset my data, reset progress, clear data, delete everything": 
        "You can reset your data entirely by clicking the red 'Reset Data' button in the dashboard header. Be careful, as this will delete all your curriculum and result progress!"
}

@app.post("/api/chat", response_model=schemas.ChatResponse)
def chat_with_bot(request: schemas.ChatRequest, current_user: models.User = Depends(auth.get_current_user)):
    user_msg = request.message.lower().strip()
    
    # We compare the user message against all the keys (which contain various keywords/phrases)
    questions = list(TRAINING_DATA.keys())
    
    # Extract highest match
    match, score = process.extractOne(user_msg, questions)
    
    # If the score is above our confidence threshold (e.g., 50%)
    if score >= 50:
        return {"response": TRAINING_DATA[match]}
    else:
        return {"response": "I'm sorry, I'm just a simple bot trained specifically for Credit Tracker. I can answer questions about how to use the app, uploading results, GPA/CGPA calculation, and arrears. Can you rephrase?"}
