"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, FileDown } from "lucide-react";
import { RichTextEditor } from "@/components/rich-text-editor";


interface TA {
  name: string;
  email: string;
}

interface Assignment {
  title: string;
  date: string;
  description: string;
}

interface EvaluationItem {
  name: string;
  percentage: string;
  description: string;
}

export default function SyllabusGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);

  // Course info
  const [courseNumber, setCourseNumber] = useState("");
  const [courseName, setCourseName] = useState("");

  // Instructor and course info
  const [instructorName, setInstructorName] = useState("");
  const [office, setOffice] = useState("");
  const [email, setEmail] = useState("");
  const [officeHours, setOfficeHours] = useState("");
  const [classTime, setClassTime] = useState("");
  const [classroom, setClassroom] = useState("");
  const [labTime, setLabTime] = useState("");
  const [labRoom, setLabRoom] = useState("");
  const [homepage, setHomepage] = useState("");
  const [courseMailList, setCourseMailList] = useState("");

  // Dynamic lists
  const [tas, setTas] = useState<TA[]>([{ name: "", email: "" }]);
  const [assignments, setAssignments] = useState<Assignment[]>([
    { title: "", date: "", description: "" },
  ]);
  const [evaluationCriteria, setEvaluationCriteria] = useState<
    EvaluationItem[]
  >([{ name: "", percentage: "", description: "" }]);

  // Important dates
  const [importantDates, setImportantDates] = useState("");

  // Course details
  const [courseDescription, setCourseDescription] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState("");
  const [courseRationale, setCourseRationale] = useState("");
  const [classFormat, setClassFormat] = useState("");
  const [notes, setNotes] = useState("");
  const [studentDeclaration, setStudentDeclaration] = useState("");
  const [examRequirements, setExamRequirements] = useState("");
  const [academicStandards, setAcademicStandards] = useState("");
  const [requiredTexts, setRequiredTexts] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [topicsList, setTopicsList] = useState("");

  const addTA = () => {
    setTas([...tas, { name: "", email: "" }]);
  };

  const removeTA = (index: number) => {
    if (tas.length > 1) {
      setTas(tas.filter((_, i) => i !== index));
    }
  };

  const updateTA = (index: number, field: keyof TA, value: string) => {
    const newTas = [...tas];
    newTas[index][field] = value;
    setTas(newTas);
  };

  const addAssignment = () => {
    setAssignments([...assignments, { title: "", date: "", description: "" }]);
  };

  const removeAssignment = (index: number) => {
    if (assignments.length > 1) {
      setAssignments(assignments.filter((_, i) => i !== index));
    }
  };

  const updateAssignment = (
    index: number,
    field: keyof Assignment,
    value: string
  ) => {
    const newAssignments = [...assignments];
    newAssignments[index][field] = value;
    setAssignments(newAssignments);
  };

  const addEvaluationItem = () => {
    setEvaluationCriteria([
      ...evaluationCriteria,
      { name: "", percentage: "", description: "" },
    ]);
  };

  const removeEvaluationItem = (index: number) => {
    if (evaluationCriteria.length > 1) {
      setEvaluationCriteria(evaluationCriteria.filter((_, i) => i !== index));
    }
  };

  const updateEvaluationItem = (
    index: number,
    field: keyof EvaluationItem,
    value: string
  ) => {
    const newItems = [...evaluationCriteria];
    newItems[index][field] = value;
    setEvaluationCriteria(newItems);
  };

  const handleGenerateSyllabus = async () => {
    setIsGenerating(true);
    try {
      const formData = {
        course_number: courseNumber,
        course_name: courseName,
        instructor_name: instructorName,
        office,
        email,
        office_hours: officeHours,
        class_time: classTime,
        classroom,
        lab_time: labTime,
        lab_room: labRoom,
        homepage,
        course_mail_list: courseMailList,
        tas: tas.filter((ta) => ta.name || ta.email),
        assignments: assignments.filter(
          (a) => a.title || a.date || a.description
        ),
        important_dates: importantDates,
        course_description: courseDescription,
        learning_outcomes: learningOutcomes,
        course_rationale: courseRationale,
        class_format: classFormat,
        evaluation_criteria: evaluationCriteria.filter(
          (item) => item.name || item.percentage || item.description
        ),
        notes,
        student_declaration: studentDeclaration,
        exam_requirements: examRequirements,
        academic_standards: academicStandards,
        required_texts: requiredTexts,
        prerequisites,
        topics_list: topicsList,
      };

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[v0] Server error:", errorData);
        throw new Error(errorData.error || "Failed to generate syllabus");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${courseNumber || "course"}-syllabus.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[v0] Error generating syllabus:", error);
      alert(
        "Failed to generate syllabus. Please check your inputs and try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="max-w-7xl px-3 py-6 m-auto bg-gradient-to-br from-background to-secondary/10">
      <div className="max-w-4xl pb-14">
        <div className="space-y-2 mb-4">
          <h1 className="text-2xl font-bold text-[#474646]">
            Create your Syllabus
          </h1>
          <p className="text-muted-foreground text-pretty">
            Fill in your course details and generate a customized syllabus
            document
          </p>
        </div>

        <div className="space-y-6">
          {/* Course Information */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">
                Course Information
              </CardTitle>
              <CardDescription>Enter the basic course details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course-number">Course Number</Label>
                  <Input
                    id="course-number"
                    value={courseNumber}
                    onChange={(e) => setCourseNumber(e.target.value)}
                    placeholder="CSCI-1803"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-name">Course Name</Label>
                  <Input
                    id="course-name"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="Water Computer Systems"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructor Information */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">
                Instructor Information
              </CardTitle>
              <CardDescription>
                Enter your contact details and office information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instructor-name">Instructor Name</Label>
                  <Input
                    id="instructor-name"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    placeholder="Dr. Seuss"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="office">Office</Label>
                  <Input
                    id="office"
                    value={office}
                    onChange={(e) => setOffice(e.target.value)}
                    placeholder="CS 123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="drseuss@cs.dal.ca"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="office-hours">Office Hours</Label>
                  <Input
                    id="office-hours"
                    value={officeHours}
                    onChange={(e) => setOfficeHours(e.target.value)}
                    placeholder="TBA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class-time">Class Meeting Time</Label>
                  <Input
                    id="class-time"
                    value={classTime}
                    onChange={(e) => setClassTime(e.target.value)}
                    placeholder="MWF 7:35-8:25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classroom">Classroom</Label>
                  <Input
                    id="classroom"
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    placeholder="CS 127"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-time">Lab Meeting Time</Label>
                  <Input
                    id="lab-time"
                    value={labTime}
                    onChange={(e) => setLabTime(e.target.value)}
                    placeholder="TR 7:35-8:25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-room">Lab Room</Label>
                  <Input
                    id="lab-room"
                    value={labRoom}
                    onChange={(e) => setLabRoom(e.target.value)}
                    placeholder="CS 134"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homepage">Course Homepage</Label>
                  <Input
                    id="homepage"
                    value={homepage}
                    onChange={(e) => setHomepage(e.target.value)}
                    placeholder="https://dal.brightspace.com/"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-mail-list">Course Mail List</Label>
                  <Input
                    id="course-mail-list"
                    value={courseMailList}
                    onChange={(e) => setCourseMailList(e.target.value)}
                    placeholder="all-cs1234@cs.dal.ca"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teaching Assistants */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">
                Teaching Assistants
              </CardTitle>
              <CardDescription>
                Add teaching assistants for your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tas.map((ta, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`ta-name-${index}`}>Name</Label>
                    <Input
                      id={`ta-name-${index}`}
                      value={ta.name}
                      onChange={(e) => updateTA(index, "name", e.target.value)}
                      placeholder="Sam I Am"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`ta-email-${index}`}>Email</Label>
                    <Input
                      id={`ta-email-${index}`}
                      type="email"
                      value={ta.email}
                      onChange={(e) => updateTA(index, "email", e.target.value)}
                      placeholder="samiam@cs.dal.ca"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeTA(index)}
                    disabled={tas.length === 1}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addTA}
                className="w-full bg-transparent"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Teaching Assistant
              </Button>
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Assignments</CardTitle>
              <CardDescription>
                Define assignment titles, due dates, and descriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignments.map((assignment, index) => (
                <div
                  key={index}
                  className="space-y-3 p-4 border border-border rounded-lg"
                >
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`assignment-title-${index}`}>
                            Title
                          </Label>
                          <Input
                            id={`assignment-title-${index}`}
                            value={assignment.title}
                            onChange={(e) =>
                              updateAssignment(index, "title", e.target.value)
                            }
                            placeholder="Assignment 1"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`assignment-date-${index}`}>
                            Due Date
                          </Label>
                          <Input
                            id={`assignment-date-${index}`}
                            value={assignment.date}
                            onChange={(e) =>
                              updateAssignment(index, "date", e.target.value)
                            }
                            placeholder="January 21"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`assignment-description-${index}`}>
                          Description
                        </Label>
                        <Input
                          id={`assignment-description-${index}`}
                          value={assignment.description}
                          onChange={(e) =>
                            updateAssignment(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Implement a Water Table Management System"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeAssignment(index)}
                      disabled={assignments.length === 1}
                      className="shrink-0 self-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addAssignment}
                className="w-full bg-transparent"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Assignment
              </Button>
            </CardContent>
          </Card>

          {/* Course Description */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">
                Course Description
              </CardTitle>
              <CardDescription>
                Describe what this course covers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="course-description"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="This course will discuss the concepts..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Learning Outcomes */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">
                Learning Outcomes
              </CardTitle>
              <CardDescription>
                What students will learn in this course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={learningOutcomes}
                onChange={setLearningOutcomes}
                placeholder="Students will be able to..."
              />
            </CardContent>
          </Card>

          {/* Course Rationale */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">
                Course Rationale
              </CardTitle>
              <CardDescription>Why this course is important</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="course-rationale"
                value={courseRationale}
                onChange={(e) => setCourseRationale(e.target.value)}
                placeholder="This course is designed to..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Class Format */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">
                Class Format and Course Communication
              </CardTitle>
              <CardDescription>
                How the class will be conducted and communication methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={classFormat}
                onChange={setClassFormat}
                placeholder="Classes will consist of lectures, labs, and assignments..."
              />
            </CardContent>
          </Card>

          {/* Evaluation Criteria */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">
                Evaluation Criteria
              </CardTitle>
              <CardDescription>
                Grading breakdown for the course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {evaluationCriteria.map((item, index) => (
                <div
                  key={index}
                  className="space-y-3 p-4 border border-border rounded-lg"
                >
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 space-y-3">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`eval-name-${index}`}>
                            Item Name
                          </Label>
                          <Input
                            id={`eval-name-${index}`}
                            value={item.name}
                            onChange={(e) =>
                              updateEvaluationItem(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Assignments"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`eval-percentage-${index}`}>
                            Percentage
                          </Label>
                          <Input
                            id={`eval-percentage-${index}`}
                            value={item.percentage}
                            onChange={(e) =>
                              updateEvaluationItem(
                                index,
                                "percentage",
                                e.target.value
                              )
                            }
                            placeholder="40%"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`eval-description-${index}`}>
                          Description
                        </Label>
                        <Textarea
                          id={`eval-description-${index}`}
                          value={item.description}
                          onChange={(e) =>
                            updateEvaluationItem(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Details about this evaluation component..."
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeEvaluationItem(index)}
                      disabled={evaluationCriteria.length === 1}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addEvaluationItem}
                className="w-full bg-transparent"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Evaluation Item
              </Button>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Notes</CardTitle>
              <CardDescription>Additional notes or information</CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={notes}
                onChange={setNotes}
                placeholder="Add any additional notes..."
              />
            </CardContent>
          </Card>

          {/* Student Declaration */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">
                Student Declaration of Absence
              </CardTitle>
              <CardDescription>Policy for student absences</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="student-declaration"
                value={studentDeclaration}
                onChange={(e) => setStudentDeclaration(e.target.value)}
                placeholder="Students who miss class due to illness..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Exam Requirements */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">
                Midterm and Final Exam Requirements
              </CardTitle>
              <CardDescription>
                Requirements and policies for exams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={examRequirements}
                onChange={setExamRequirements}
                placeholder="Describe exam requirements and policies..."
              />
            </CardContent>
          </Card>

          {/* Academic Standards */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">
                Academic Standards
              </CardTitle>
              <CardDescription>
                Academic integrity and standards policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={academicStandards}
                onChange={setAcademicStandards}
                placeholder="Describe academic standards and policies..."
              />
            </CardContent>
          </Card>

          {/* Required Texts and Resources */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">
                Required Texts and Resources
              </CardTitle>
              <CardDescription>
                Textbooks and other required materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={requiredTexts}
                onChange={setRequiredTexts}
                placeholder="List required textbooks and resources..."
              />
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Prerequisites</CardTitle>
              <CardDescription>Required prerequisite courses</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                id="prerequisites"
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                placeholder="CSCI-1210, CSCI-1221"
              />
            </CardContent>
          </Card>

          {/* Tentative Topics */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">
                Tentative List of Topics
              </CardTitle>
              <CardDescription>Course topics and schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={topicsList}
                onChange={setTopicsList}
                placeholder="List the topics that will be covered..."
              />
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Important Dates</CardTitle>
              <CardDescription>
                Reading week, exam dates, and withdrawal deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={importantDates}
                onChange={setImportantDates}
                placeholder="Add important dates for the course..."
              />
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateSyllabus}
            disabled={isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <FileDown className="h-5 w-5 mr-2" />
                Generate Syllabus
              </>
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
