from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date
from enum import Enum

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserBase(BaseModel):
    email: EmailStr

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

# Enums
class ReviewStatus(str, Enum):
    ACCEPTED = "ACCEPTED"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    REJECTED = "REJECTED"

class MatchType(str, Enum):
    EXACT = "EXACT"
    POSSIBLE_MATCH = "POSSIBLE_MATCH"
    MANUAL = "MANUAL"
    NONE = "NONE"

# Curriculum Course
class CurriculumCourseBase(BaseModel):
    course_code: str
    course_name: str
    credits: int
    mandatory: bool = True
    elective: bool = False
    prerequisites: Optional[str] = None

class CurriculumCourseCreate(CurriculumCourseBase):
    pass

class CurriculumCourse(CurriculumCourseBase):
    id: int
    curriculum_id: int
    category_id: int

    class Config:
        from_attributes = True

# Curriculum Category
class CurriculumCategoryBase(BaseModel):
    name: str
    required_credits: int
    minimum_courses: Optional[int] = None
    maximum_courses: Optional[int] = None
    description: Optional[str] = None

class CurriculumCategoryCreate(CurriculumCategoryBase):
    courses: List[CurriculumCourseCreate] = []

class CurriculumCategory(CurriculumCategoryBase):
    id: int
    curriculum_id: int
    courses: List[CurriculumCourse] = []

    class Config:
        from_attributes = True

# Curriculum
class CurriculumBase(BaseModel):
    department: str
    program: str
    regulation: str
    total_required_credits: int
    pages_analysed: int = 0
    last_page_analysed: bool = False

class CurriculumCreate(CurriculumBase):
    categories: List[CurriculumCategoryCreate] = []

class Curriculum(CurriculumBase):
    id: int
    categories: List[CurriculumCategory] = []

    class Config:
        from_attributes = True

# Student Course and Match
class CourseMatchBase(BaseModel):
    match_type: MatchType
    confidence: float
    credits_counted: int
    review_status: ReviewStatus
    category_id: Optional[int] = None
    curriculum_course_id: Optional[int] = None

class CourseMatchCreate(CourseMatchBase):
    pass

class CourseMatch(CourseMatchBase):
    id: int
    student_course_id: int

    class Config:
        from_attributes = True

class StudentCourseBase(BaseModel):
    course_code: str
    course_name: str
    credits: int
    grade: str
    semester: Optional[str] = None
    is_passed: bool = False

class StudentCourseCreate(StudentCourseBase):
    matches: List[CourseMatchCreate] = []

class StudentCourse(StudentCourseBase):
    id: int
    student_id: int
    upload_date: Optional[date] = None
    matches: List[CourseMatch] = []

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

