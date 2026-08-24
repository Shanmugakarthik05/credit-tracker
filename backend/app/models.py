from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, Float
from sqlalchemy.orm import relationship
import enum
from sqlalchemy import Enum as SQLAlchemyEnum

from .database import Base

class ReviewStatus(str, enum.Enum):
    ACCEPTED = "ACCEPTED"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    REJECTED = "REJECTED"

class MatchType(str, enum.Enum):
    EXACT = "EXACT"
    POSSIBLE_MATCH = "POSSIBLE_MATCH"
    MANUAL = "MANUAL"
    NONE = "NONE"

class Curriculum(Base):
    __tablename__ = "curriculums"

    id = Column(Integer, primary_key=True, index=True)
    department = Column(String, index=True)
    program = Column(String)
    regulation = Column(String)
    total_required_credits = Column(Integer)
    pages_analysed = Column(Integer, default=0)
    last_page_analysed = Column(Boolean, default=False)

    categories = relationship("CurriculumCategory", back_populates="curriculum", cascade="all, delete-orphan")
    courses = relationship("CurriculumCourse", back_populates="curriculum", cascade="all, delete-orphan")
    students = relationship("Student", back_populates="curriculum")


class CurriculumCategory(Base):
    __tablename__ = "curriculum_categories"

    id = Column(Integer, primary_key=True, index=True)
    curriculum_id = Column(Integer, ForeignKey("curriculums.id"))
    name = Column(String)
    required_credits = Column(Integer)
    minimum_courses = Column(Integer, nullable=True)
    maximum_courses = Column(Integer, nullable=True)
    description = Column(String, nullable=True)

    curriculum = relationship("Curriculum", back_populates="categories")
    courses = relationship("CurriculumCourse", back_populates="category")


class CurriculumCourse(Base):
    __tablename__ = "curriculum_courses"

    id = Column(Integer, primary_key=True, index=True)
    curriculum_id = Column(Integer, ForeignKey("curriculums.id"))
    category_id = Column(Integer, ForeignKey("curriculum_categories.id"))
    
    course_code = Column(String, index=True)
    course_name = Column(String)
    credits = Column(Integer)
    mandatory = Column(Boolean, default=True)
    elective = Column(Boolean, default=False)
    prerequisites = Column(String, nullable=True)

    curriculum = relationship("Curriculum", back_populates="courses")
    category = relationship("CurriculumCategory", back_populates="courses")
    matches = relationship("CourseMatch", back_populates="curriculum_course")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    student = relationship("Student", back_populates="user", uselist=False)


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String, index=True)
    curriculum_id = Column(Integer, ForeignKey("curriculums.id"), nullable=True)
    
    user = relationship("User", back_populates="student")
    curriculum = relationship("Curriculum", back_populates="students")
    courses = relationship("StudentCourse", back_populates="student", cascade="all, delete-orphan")


class StudentCourse(Base):
    __tablename__ = "student_courses"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    course_code = Column(String)
    course_name = Column(String)
    credits = Column(Integer)
    grade = Column(String)
    semester = Column(String, nullable=True)
    is_passed = Column(Boolean, default=False)
    upload_date = Column(Date, nullable=True)

    student = relationship("Student", back_populates="courses")
    matches = relationship("CourseMatch", back_populates="student_course", cascade="all, delete-orphan")


class CourseMatch(Base):
    __tablename__ = "course_matches"

    id = Column(Integer, primary_key=True, index=True)
    student_course_id = Column(Integer, ForeignKey("student_courses.id"))
    curriculum_course_id = Column(Integer, ForeignKey("curriculum_courses.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("curriculum_categories.id"), nullable=True)
    
    match_type = Column(SQLAlchemyEnum(MatchType), default=MatchType.NONE)
    confidence = Column(Float, default=0.0)
    credits_counted = Column(Integer, default=0)
    review_status = Column(SQLAlchemyEnum(ReviewStatus), default=ReviewStatus.REVIEW_REQUIRED)

    student_course = relationship("StudentCourse", back_populates="matches")
    curriculum_course = relationship("CurriculumCourse", back_populates="matches")
    category = relationship("CurriculumCategory")
