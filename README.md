At the beginning of each academic semester at HTU University, the academic administration faces challenges in organizing the process of assigning courses to instructors and teaching assistants (TAs). Handling a large number of courses, instructors, and available time slots often leads to scheduling conflicts and difficulties in efficiently tracking course assignments.

To address this problem, the university decided to develop an electronic application that helps organize and manage the course registration and scheduling process in a centralized and structured manner. The application is designed using multiple pages, where each page is responsible for performing a specific task that supports effective academic management.

The application includes an Add Schedule page that allows administrators to add courses to the semester schedule by specifying the lecture time, selected course, assigned instructor, and teaching assistant. It also includes a View Schedule page that displays the complete schedule in a clear and organized format. In addition, a Manage Courses page is provided to view and manage all available courses, and a Manage Instructors page is used to manage instructor information and their assigned courses.

The development team has completed building the application. The back-end is implemented using Spring Boot and is hosted in a separate GitHub repository.

The system provides the following back-end API methods:

GET Courses
This method retrieves all available courses in the system. It is used to display the list of courses and allows administrators to select courses when creating schedules. This method is used in the Courses page and in schedule creation forms.

POST Course
This method is responsible for creating a new course. It saves course details such as name, code, description, and instructor, and stores the data in the Courses table or collection. It is used in the course management page.

GET Scheduled Classes
This method retrieves all scheduled classes. It returns detailed schedule information including the course, day, time slot, location, and instructor. It is used in the “All Scheduled Classes” page.

POST Scheduled Class
This method creates a new scheduled class by linking a course to a specific day and time slot. It prevents scheduling conflicts and saves the schedule entry in the database. This method is used in the admin or staff scheduling interface.

PATCH Scheduled Class
This method updates an existing scheduled class. It allows modifications to the time, day, location, or instructor, and is used to modify schedules, fix conflicts, or reschedule classes.

DELETE Scheduled Class
This method deletes a scheduled class from the system. It removes the class from the schedule and frees the associated time slot.

For deployment instructions and additional configuration details, the back-end GitHub repository should be reviewed, as it contains the necessary information for correctly deploying the application.

https://github.com/iBreVen/HTU-Schedemy-Website-Backend
