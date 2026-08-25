import pdfplumber
import re
from typing import List, Dict, Any, Tuple
from thefuzz import fuzz, process

def extract_curriculum_from_pdf(file_path: str) -> Dict[str, Any]:
    """
    Extracts curriculum information from a PDF file.
    Includes strict Last-Page guarantees and advanced parsing (mandatory/elective).
    """
    subjects = []
    categories_set = set()
    
    subject_code_pattern = re.compile(r"^[A-Z0-9]{5,10}$")
    category_keywords = ["Core", "Elective", "Science", "Humanities", "Mandatory", "Project", "Laboratory", "Practical"]
    
    current_category = "General"
    current_semester = 1
    
    category_map = {
        "HS": "Humanities and Science",
        "BS": "Basic Science",
        "ES": "Engineering Science",
        "PC": "Professional Core",
        "PE": "Professional Elective", "Professional Electives": "Professional Elective", "PS": "Professional Elective",
        "OE": "Open Elective", "Open Electives": "Open Elective",
        "EEC": "Employability Enhancement Courses", "Employability Enhancement": "Employability Enhancement Courses",
        "MC": "Mandatory Courses"
    }

    pages_analysed = 0
    last_page_analysed = False

    with pdfplumber.open(file_path) as pdf:
        total_pages = len(pdf.pages)
        for i, page in enumerate(pdf.pages):
            pages_analysed += 1
            tables = page.extract_tables()
            for table in tables:
                header_row = []
                cat_idx, code_idx, name_idx, c_idx = -1, -1, -1, -1
                
                for row in table:
                    clean_row = [str(cell).strip().replace('\n', ' ') if cell else "" for cell in row]
                    if not clean_row or not any(clean_row):
                        continue
                        
                    lower_row = [c.lower() for c in clean_row]
                    if any("title" in c or "name" in c or "subject" in c or "code" in c for c in lower_row):
                        header_row = lower_row
                        for idx, cell in enumerate(lower_row):
                            if "category" in cell: cat_idx = idx
                            elif "code" in cell and code_idx == -1: code_idx = idx
                            elif "title" in cell or "name" in cell or "subject" in cell: name_idx = idx
                            elif "total credit" in cell or cell == "c" or "credits" in cell or "credit" in cell: c_idx = idx
                        continue
                    
                    populated = [c for c in clean_row if c]
                    if len(populated) == 1:
                        text = populated[0]
                        if any(kw.lower() in text.lower() for kw in category_keywords):
                            short_cat = category_map.get(text, text)
                            current_category = short_cat
                            categories_set.add(current_category)
                        if "semester" in text.lower():
                            sem_match = re.search(r'semester\s+(\d+)', text.lower())
                            if sem_match:
                                current_semester = int(sem_match.group(1))
                        continue

                    if len(clean_row) < 3:
                        continue
                    
                    code = None
                    if code_idx != -1 and code_idx < len(clean_row):
                        code = clean_row[code_idx]
                        if not subject_code_pattern.match(code): code = None
                        
                    if not code:
                        for cell in clean_row:
                            if subject_code_pattern.match(cell):
                                code = cell
                                break
                        
                    if code:
                        name = ""
                        credits = -1
                        row_category = current_category
                        
                        if cat_idx != -1 and cat_idx < len(clean_row):
                            raw_cat = clean_row[cat_idx].strip()
                            if raw_cat:
                                row_category = category_map.get(raw_cat, raw_cat)
                            
                        if name_idx != -1 and name_idx < len(clean_row):
                            name = clean_row[name_idx]
                        if c_idx != -1 and c_idx < len(clean_row):
                            c_val = clean_row[c_idx]
                            if c_val.isdigit(): credits = int(c_val)
                                
                        if not name or credits == -1:
                            for cell in clean_row:
                                if cell.isdigit() and 0 <= int(cell) <= 6 and credits == -1:
                                    credits = int(cell)
                                elif len(cell) > 5 and not cell.isdigit() and cell != code and not name:
                                    name = cell
                                    
                        if name and credits != -1:
                            if credits == 0:
                                row_category = "Mandatory Courses"
                                
                            _name_lower = name.lower()
                            if any(kw in _name_lower for kw in [
                                "implant", "inplant", "in-plant", "in plant",
                                "internship", "industrial training",
                                "vocational training", "industry training",
                                "training",
                            ]):
                                row_category = "Others"
                                
                            mandatory = "elective" not in row_category.lower()
                            if not any(s['course_code'] == code for s in subjects):
                                subjects.append({
                                    "course_code": code,
                                    "course_name": name,
                                    "credits": credits,
                                    "category": row_category,
                                    "mandatory": mandatory,
                                    "elective": not mandatory,
                                    "prerequisites": None
                                })
                            categories_set.add(row_category)
    categories_set = {cat for cat in categories_set if cat.strip()}
    categories_dict = {cat: {"name": category_map.get(cat, cat), "required_credits": 0, "minimum_courses": None, "maximum_courses": None, "description": None, "courses": []} for cat in categories_set}
    
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            if page.extract_tables():
                for table in page.extract_tables():
                    is_summary = False
                    cat_col, req_col = -1, -1
                    for row in table:
                        clean_row = [str(cell).strip().replace('\n', ' ') if cell else "" for cell in row]
                        if not clean_row or not any(clean_row): continue
                            
                        lower_row = [c.lower() for c in clean_row]
                        
                        has_category = any("category" in c for c in lower_row)
                        has_credits = any("credit" in c and "earned" in c for c in lower_row) or any("credits" == c for c in lower_row)
                        
                        if has_category and has_credits:
                            is_summary = True
                            last_page_analysed = True
                            for i, cell in enumerate(lower_row):
                                if "category" in cell: cat_col = i
                                elif "earned" in cell and "regular" in cell: req_col = i
                                elif "credit" in cell and req_col == -1 and "lateral" not in cell: req_col = i
                            continue
                            
                        if is_summary and cat_col != -1 and req_col != -1 and len(clean_row) > max(cat_col, req_col):
                            cat_name = clean_row[cat_col]
                            req_val = clean_row[req_col]
                            if cat_name and req_val.isdigit() and "total" not in cat_name.lower():
                                short_code = category_map.get(cat_name, cat_name)
                                if short_code in categories_dict:
                                    categories_dict[short_code]["required_credits"] = int(req_val)
                                else:
                                    categories_dict[short_code] = {"name": short_code, "required_credits": int(req_val), "courses": []}

    # Fallback removed as requested

    for sub in subjects:
        cat = sub["category"]
        if cat in categories_dict:
            categories_dict[cat]["courses"].append(sub)
        else:
            categories_dict[cat] = {"name": category_map.get(cat, cat), "required_credits": sub["credits"], "courses": [sub]}
        
    return {
        "department": "Parsed Department",
        "program": "Parsed Program",
        "regulation": "Parsed Regulation",
        "pages_analysed": pages_analysed,
        "last_page_analysed": last_page_analysed,
        "total_required_credits": sum([cat["required_credits"] for cat in categories_dict.values()]),
        "categories": list(categories_dict.values())
    }


def extract_result_from_pdf(file_path: str) -> List[Dict[str, Any]]:
    results = []
    subject_code_pattern = re.compile(r"^[A-Z]{2,5}[0-9]{3,6}$")
    grade_set = {'O', 'A+', 'A', 'B+', 'B', 'C', 'U', 'F', 'RA', 'W', 'ABSENT', 'AB', 'SA', 'WH', 'I', 'PASS', 'FAIL', 'NE'}
    semester_pattern = re.compile(r'(?:semester|sem)[\s\-:]*(\d+)', re.IGNORECASE)
    fail_grades = {'U', 'F', 'RA', 'W', 'ABSENT', 'FAIL', 'AB', 'SA', 'WH', 'I', 'INCOMPLETE', 'NE'}

    current_semester = None
    code_idx = name_idx = credit_idx = grade_idx = -1

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            # Scan raw page text for semester markers first
            text = page.extract_text() or ""
            for line in text.splitlines():
                m = semester_pattern.search(line)
                if m:
                    current_semester = f"Semester {m.group(1)}"
                    break

            tables = page.extract_tables()
            for table in tables:
                # Reset column detection per table
                code_idx = name_idx = credit_idx = grade_idx = -1

                for row in table:
                    if not row: continue
                    clean_row = [str(cell).strip().replace('\n', ' ') if cell else "" for cell in row]
                    if not any(clean_row): continue

                    row_text = " ".join(clean_row)

                    # Semester detection from row text
                    m = semester_pattern.search(row_text)
                    if m:
                        current_semester = f"Semester {m.group(1)}"
                        continue

                    # Header detection: find column positions
                    lower = [c.lower() for c in clean_row]
                    if any("course" in c or "subject" in c or "code" in c for c in lower):
                        code_idx = name_idx = credit_idx = grade_idx = -1
                        for i, c in enumerate(lower):
                            if ("code" in c or "r2019" in c or "r2024" in c) and code_idx == -1:
                                code_idx = i
                            elif ("title" in c or "name" in c or "subject" in c) and name_idx == -1:
                                name_idx = i
                            elif ("credit" in c) and credit_idx == -1:
                                credit_idx = i
                            elif "grade" in c and grade_idx == -1:
                                grade_idx = i
                        continue

                    # Data row extraction
                    raw_code = None
                    raw_name = None
                    credits = 0
                    grade = None

                    if code_idx != -1 and code_idx < len(clean_row):
                        candidate = clean_row[code_idx].strip().upper()
                        if subject_code_pattern.match(candidate):
                            raw_code = candidate

                    if name_idx != -1 and name_idx < len(clean_row):
                        raw_name = clean_row[name_idx].strip()

                    if credit_idx != -1 and credit_idx < len(clean_row):
                        val = clean_row[credit_idx].strip()
                        if val.isdigit() and 1 <= int(val) <= 10:
                            credits = int(val)

                    if grade_idx != -1 and grade_idx < len(clean_row):
                        candidate = clean_row[grade_idx].strip().upper()
                        if candidate in grade_set:
                            grade = candidate

                    # Fallback: scan whole row
                    if not raw_code:
                        for cell in clean_row:
                            c = cell.strip().upper()
                            if subject_code_pattern.match(c):
                                raw_code = c
                                break

                    if not grade:
                        for cell in reversed(clean_row):
                            c = cell.strip().upper()
                            if c in grade_set:
                                grade = c
                                break

                    if credits == 0:
                        for cell in clean_row:
                            c = cell.strip()
                            if c.isdigit() and 1 <= int(c) <= 10:
                                credits = int(c)

                    if not raw_name and raw_code:
                        for cell in clean_row:
                            c = cell.strip()
                            if c and c.upper() != raw_code and c.upper() not in grade_set and not c.isdigit() and len(c) > 5:
                                raw_name = c
                                break

                    if raw_code and grade:
                        if not raw_name:
                            raw_name = "Unknown"
                        is_passed = grade.upper() not in fail_grades
                        results.append({
                            "semester": current_semester,
                            "raw_code": raw_code,
                            "raw_name": raw_name,
                            "grade": grade,
                            "credits": credits,
                            "is_passed": is_passed
                        })

    return results




def fuzzy_match_subject(raw_name: str, raw_code: str, curriculum_courses: List[Dict]) -> Tuple[Dict, float, List[Dict]]:
    """
    Returns (Best Match Dict, Confidence Score 0-100, List of possible alternatives)
    """
    possible_matches = []
    
    # 1. Exact code match (100% confidence)
    for sub in curriculum_courses:
        if sub['code'] == raw_code:
            return sub, 100.0, []
            
    # 2. Normalized code match (95% confidence)
    norm_raw_code = re.sub(r'[^A-Z0-9]', '', raw_code.upper())
    for sub in curriculum_courses:
        norm_sub_code = re.sub(r'[^A-Z0-9]', '', sub['code'].upper())
        if norm_sub_code == norm_raw_code:
            return sub, 95.0, []
            
    # 3. Fuzzy name match
    subject_names = [sub['name'] for sub in curriculum_courses]
    results = process.extract(raw_name, subject_names, scorer=fuzz.token_sort_ratio, limit=3)
    
    best_match = None
    best_score = 0.0
    
    if results:
        best_score = float(results[0][1])
        if best_score > 60:
            for r in results:
                for sub in curriculum_courses:
                    if sub['name'] == r[0]:
                        if best_match is None and r == results[0]:
                            best_match = sub
                        possible_matches.append({"id": sub["id"], "name": sub["name"], "category_id": sub["category_id"], "score": r[1]})
                        break
                        
    return best_match, best_score, possible_matches

def extract_online_curriculum_from_pdf(file_path: str) -> List[Dict[str, Any]]:
    courses = []
    
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    clean_row = [str(cell).strip().replace('\n', ' ') if cell else "" for cell in row]
                    if len(clean_row) < 9: continue
                    
                    # Skip headers
                    if "Course Title" in clean_row or "Credits" in clean_row:
                        continue
                        
                    # Standard columns: S.No, Dept, R2024, R2019, Platform, Title, Duration, CGPA, Credits
                    # We will rely on column indices since the table is strictly formatted.
                    code_r2019 = clean_row[3]
                    title = clean_row[5]
                    
                    credits_str = clean_row[8]
                    credits = 3
                    if credits_str.isdigit():
                        credits = int(credits_str)
                    
                    # Fallback code just in case
                    code = code_r2019 if code_r2019 else clean_row[2]
                    
                    if code and title and len(code) >= 5:
                        if not any(c['course_code'] == code for c in courses):
                            courses.append({
                                "course_code": code,
                                "course_name": title,
                                "credits": credits,
                                "mandatory": False,
                                "elective": True
                            })
                            
    return courses

def extract_special_curriculum_from_pdf(file_path: str) -> List[Dict[str, Any]]:
    courses = []
    
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                code_idx = -1
                title_idx = -1
                credit_idx = -1
                
                for row in table:
                    clean_row = [str(cell).strip().replace('\n', ' ') if cell else "" for cell in row]
                    if not any(clean_row): continue
                    
                    lower_row = [c.lower() for c in clean_row]
                    
                    # Detect headers
                    if "course title" in lower_row or "title" in lower_row:
                        for i, cell in enumerate(lower_row):
                            if "r2019" in cell: code_idx = i
                            elif "code" in cell and code_idx == -1: code_idx = i
                            elif "title" in cell: title_idx = i
                            elif "total" in cell and "credit" in cell: credit_idx = i
                            elif "credits" == cell and credit_idx == -1: credit_idx = i
                            elif "credit" in cell and credit_idx == -1: credit_idx = i
                        
                        # Fallback for code if R2019 missing but R2024 present
                        if code_idx == -1:
                            for i, cell in enumerate(lower_row):
                                if "r2024" in cell: code_idx = i
                        continue
                        
                    # If we have headers, extract
                    if code_idx != -1 and title_idx != -1 and credit_idx != -1 and len(clean_row) > max(code_idx, title_idx, credit_idx):
                        code = clean_row[code_idx]
                        title = clean_row[title_idx]
                        credits_str = clean_row[credit_idx]
                        
                        credits = 3
                        if credits_str.isdigit():
                            credits = int(credits_str)
                            
                        if code and title and len(code) >= 5 and code.upper() != "NA":
                            if not any(c['course_code'] == code for c in courses):
                                courses.append({
                                    "course_code": code,
                                    "course_name": title,
                                    "credits": credits,
                                    "mandatory": False,
                                    "elective": True
                                })
                                
    return courses

