package com.example.backend;

import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private static final String STUDENT_NOT_FOUND = "Student not found";
    private static final String USER_ROLE = "userRole";

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;

    public StudentController(
            StudentRepository studentRepository,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            CourseRepository courseRepository) {

        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.courseRepository = courseRepository;
    }

    // ADMIN + NORMAL USER
    @GetMapping
    public List<Student> getAllStudents() {

        return studentRepository.findAll();
    }

    // ADMIN + NORMAL USER
    @GetMapping("/{id}")
    public Student getStudentById(
            @PathVariable Integer id) {

        return studentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(STUDENT_NOT_FOUND));
    }

    // ADMIN + NORMAL USER
    @PostMapping
    public Object addStudent(
            @RequestBody Student student,
            HttpSession session) {

        String role =
                (String) session.getAttribute(USER_ROLE);

        if (role == null) {
            return "Please login first";
        }

        Integer userId =
                student.getUser().getId();

        Integer departmentId =
                student.getDepartment().getId();

        Integer courseId =
                student.getCourse().getId();

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"));

        Department department =
                departmentRepository.findById(departmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Department not found"));

        Course course =
                courseRepository.findById(courseId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Course not found"));

        /*
         * Find the lowest available student ID.
         *
         * Example:
         * Existing IDs: 1, 3, 4
         * New student gets ID: 2
         */
        int newStudentId = 1;

        while (studentRepository.existsById(newStudentId)) {
            newStudentId++;
        }

        student.setId(newStudentId);

        student.setUser(user);
        student.setDepartment(department);
        student.setCourse(course);

        return studentRepository.save(student);
    }

    // ADMIN ONLY
    @PutMapping("/{id}")
    public Object updateStudent(
            @PathVariable Integer id,
            @RequestBody Student updatedStudent,
            HttpSession session) {

        String role =
                (String) session.getAttribute(USER_ROLE);

        if (!"ADMIN".equals(role)) {
            return "Access denied. Admin only.";
        }

        Student student =
                studentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        STUDENT_NOT_FOUND));

        Integer departmentId =
                updatedStudent.getDepartment().getId();

        Integer courseId =
                updatedStudent.getCourse().getId();

        Department department =
                departmentRepository.findById(departmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Department not found"));

        Course course =
                courseRepository.findById(courseId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Course not found"));

        student.setName(
                updatedStudent.getName());

        student.setEmail(
                updatedStudent.getEmail());

        student.setPhone(
                updatedStudent.getPhone());

        student.setDateOfBirth(
                updatedStudent.getDateOfBirth());

        student.setGender(
                updatedStudent.getGender());

        student.setAddress(
                updatedStudent.getAddress());

        student.setCourse(course);

        student.setDepartment(department);

        student.setYear(
                updatedStudent.getYear());

        student.setSemester(
                updatedStudent.getSemester());

        return studentRepository.save(student);
    }

    // ADMIN ONLY
    @DeleteMapping("/{id}")
    public String deleteStudent(
            @PathVariable Integer id,
            HttpSession session) {

        String role =
                (String) session.getAttribute(USER_ROLE);

        if (!"ADMIN".equals(role)) {
            return "Access denied. Admin only.";
        }

        if (!studentRepository.existsById(id)) {
            return STUDENT_NOT_FOUND;
        }

        studentRepository.deleteById(id);

        return "Student deleted successfully!";
    }
}
