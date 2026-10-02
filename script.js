let currentUser = null;


// ================================
// LOAD CURRENT USER
// ================================

async function loadCurrentUser() {

    const response =
        await fetch("/users/me");

    if (!response.ok) {

        document.getElementById("userInfo").textContent =
            "Unable to load user information.";

        return;
    }

    const user =
        await response.json();

    if (!user.id) {

        document.getElementById("userInfo").textContent =
            "Please login first.";

        return;
    }

    currentUser = user;

    document.getElementById("userInfo").textContent =
        "Logged in as: " +
        user.email +
        " | Role: " +
        user.role;
}


// ================================
// LOAD DEPARTMENTS
// ================================

async function loadDepartments() {

    const response =
        await fetch("/api/departments");

    if (!response.ok) {
        return;
    }

    const departments =
        await response.json();

    const departmentSelect =
        document.getElementById("departmentId");

    departmentSelect.innerHTML =
        '<option value="">Select Department</option>';

    departments.forEach(department => {

        const option =
            document.createElement("option");

        option.value =
            department.id;

        option.textContent =
            department.name;

        departmentSelect.appendChild(option);
    });
}


// ================================
// LOAD COURSES
// ================================

async function loadCourses() {

    const response =
        await fetch("/api/courses");

    if (!response.ok) {
        return;
    }

    const courses =
        await response.json();

    const courseSelect =
        document.getElementById("courseId");

    courseSelect.innerHTML =
        '<option value="">Select Course</option>';

    courses.forEach(course => {

        const option =
            document.createElement("option");

        option.value =
            course.id;

        option.textContent =
            course.name;

        courseSelect.appendChild(option);
    });
}


// ================================
// VIEW STUDENTS
// ================================

async function loadStudents() {

    const response =
        await fetch("/api/students");

    if (!response.ok) {

        document.getElementById("studentsList").innerHTML =
            "<p>Unable to load students.</p>";

        return;
    }

    const students =
        await response.json();

    if (students.length === 0) {

        document.getElementById("studentsList").innerHTML =
            "<p>No students registered yet.</p>";

        return;
    }


    let html = `
        <table>

            <tr>

                <th>ID</th>

                <th>Name</th>

                <th>Email</th>

                <th>Phone</th>

                <th>Date of Birth</th>

                <th>Gender</th>

                <th>Address</th>

                <th>Course</th>

                <th>Department</th>

                <th>Year</th>

                <th>Semester</th>

                <th>Actions</th>

            </tr>
    `;


    students.forEach(student => {

        let actions = "";


        // ==================================
        // ADMIN ONLY
        // ==================================

        if (
            currentUser &&
            currentUser.role === "ADMIN"
        ) {

            actions = `
                <button
                    onclick="editStudent(${student.id})"
                    style="
                        background:#f59e0b;
                        color:white;
                        margin-bottom:6px;
                        width:100%;
                    ">

                    Edit

                </button>

                <button
                    onclick="deleteStudent(${student.id})"
                    style="
                        background:#dc2626;
                        color:white;
                        width:100%;
                    ">

                    Delete

                </button>
            `;
        }


        html += `
            <tr>

                <td>
                    ${student.id}
                </td>

                <td>
                    ${student.name}
                </td>

                <td>
                    ${student.email}
                </td>

                <td>
                    ${student.phone}
                </td>

                <td>
                    ${student.dateOfBirth}
                </td>

                <td>
                    ${student.gender}
                </td>

                <td>
                    ${student.address}
                </td>

                <td>
                    ${student.course
                        ? student.course.name
                        : ""}
                </td>

                <td>
                    ${student.department
                        ? student.department.name
                        : ""}
                </td>

                <td>
                    ${student.year}
                </td>

                <td>
                    ${student.semester}
                </td>

                <td>
                    ${actions}
                </td>

            </tr>
        `;
    });


    html += "</table>";


    document.getElementById("studentsList").innerHTML =
        html;
}


// ================================
// EDIT STUDENT
// ADMIN ONLY
// ================================

async function editStudent(id) {

    if (
        !currentUser ||
        currentUser.role !== "ADMIN"
    ) {

        alert("Access denied. Admin only.");

        return;
    }


    const response =
        await fetch("/api/students/" + id);


    if (!response.ok) {

        alert("Unable to load student.");

        return;
    }


    const student =
        await response.json();


    document.getElementById("studentName").value =
        student.name;

    document.getElementById("studentEmail").value =
        student.email;

    document.getElementById("phone").value =
        student.phone;

    document.getElementById("dateOfBirth").value =
        student.dateOfBirth;

    document.getElementById("gender").value =
        student.gender;

    document.getElementById("address").value =
        student.address;

    document.getElementById("departmentId").value =
        student.department.id;

    document.getElementById("courseId").value =
        student.course.id;

    document.getElementById("year").value =
        student.year;

    document.getElementById("semester").value =
        student.semester;


    document.getElementById("message").textContent =
        "Student loaded for editing.";


    document.getElementById("studentForm").dataset.editingId =
        id;


    window.scrollTo({
        top:
            document.getElementById("studentForm").offsetTop,

        behavior:
            "smooth"
    });
}


// ================================
// DELETE STUDENT
// ADMIN ONLY
// ================================

async function deleteStudent(id) {

    if (
        !currentUser ||
        currentUser.role !== "ADMIN"
    ) {

        alert("Access denied. Admin only.");

        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this student?"
        );


    if (!confirmed) {
        return;
    }


    const response =
        await fetch(
            "/api/students/" + id,
            {
                method: "DELETE"
            }
        );


    const result =
        await response.text();


    if (
        response.ok &&
        result === "Student deleted successfully!"
    ) {

        document.getElementById("message").textContent =
            "Student deleted successfully.";

        loadStudents();

    } else {

        document.getElementById("message").textContent =
            result || "Unable to delete student.";
    }
}


// ================================
// REGISTER / UPDATE STUDENT
// ================================

document.getElementById("studentForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        if (!currentUser) {

            document.getElementById("message").textContent =
                "Please login first.";

            return;
        }


        const editingId =
            this.dataset.editingId;


        // USER CANNOT EDIT
        if (
            editingId &&
            currentUser.role !== "ADMIN"
        ) {

            document.getElementById("message").textContent =
                "Access denied. Admin only.";

            return;
        }


        const departmentId =
            document.getElementById("departmentId").value;

        const courseId =
            document.getElementById("courseId").value;


        const student = {

            user: {
                id: currentUser.id
            },

            name:
                document.getElementById("studentName").value,

            email:
                document.getElementById("studentEmail").value,

            phone:
                document.getElementById("phone").value,

            dateOfBirth:
                document.getElementById("dateOfBirth").value,

            gender:
                document.getElementById("gender").value,

            address:
                document.getElementById("address").value,

            course: {
                id: Number(courseId)
            },

            department: {
                id: Number(departmentId)
            },

            year:
                Number(
                    document.getElementById("year").value
                ),

            semester:
                Number(
                    document.getElementById("semester").value
                )
        };


        let response;


        // ADMIN UPDATE
        if (editingId) {

            response =
                await fetch(
                    "/api/students/" + editingId,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(student)
                    }
                );

        }


        // USER + ADMIN ADD
        else {

            response =
                await fetch(
                    "/api/students",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(student)
                    }
                );
        }


        if (response.ok) {

            document.getElementById("message").textContent =
                editingId
                    ? "Student updated successfully."
                    : "Student registered successfully.";


            this.reset();

            delete this.dataset.editingId;


            loadStudents();

        } else {

            const error =
                await response.text();

            document.getElementById("message").textContent =
                "Operation failed: " + error;
        }

    }
);


// ================================
// PAGE LOAD
// ================================

loadCurrentUser();

loadDepartments();

loadCourses();
