package com.idea.bootstrap;

import static com.idea.bootstrap.SampleData.exam;
import static com.idea.bootstrap.SampleData.multiple;
import static com.idea.bootstrap.SampleData.option;
import static com.idea.bootstrap.SampleData.shortText;
import static com.idea.bootstrap.SampleData.single;
import static com.idea.bootstrap.SampleData.student;
import static com.idea.bootstrap.SampleData.subject;
import static com.idea.bootstrap.SampleData.teacher;
import static com.idea.bootstrap.SampleData.trueFalse;

import com.idea.attempt.dto.AnswerSubmission;
import com.idea.attempt.dto.SubmitAttemptRequest;
import com.idea.attempt.service.AttemptService;
import com.idea.auth.dto.RegisterRequest;
import com.idea.auth.service.AuthService;
import com.idea.exam.domain.AcademicLevel;
import com.idea.exam.domain.DifficultyLevel;
import com.idea.exam.domain.QuestionType;
import com.idea.exam.dto.GradingExam;
import com.idea.exam.dto.GradingOption;
import com.idea.exam.service.ExamService;
import com.idea.exam.service.SubjectService;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Populates the database with realistic demo data on startup, so the app never
 * looks empty during development or demos.
 *
 * <p>It creates everything through the public services (the same path real users
 * take), so the seeded data passes every validation rule. It is idempotent: it
 * skips seeding when any student already exists. Disable with
 * {@code APP_SEED_ENABLED=false}.</p>
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DevDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);

    private final AuthService authService;
    private final SubjectService subjectService;
    private final ExamService examService;
    private final AttemptService attemptService;

    public DevDataSeeder(
            AuthService authService,
            SubjectService subjectService,
            ExamService examService,
            AttemptService attemptService) {
        this.authService = authService;
        this.subjectService = subjectService;
        this.examService = examService;
        this.attemptService = attemptService;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!authService.listStudents().isEmpty()) {
            log.info("Demo seed skipped: data already present.");
            return;
        }
        log.info("Seeding demo data…");

        UUID teacher = register(teacher("profesor@idea.edu", "Prof. Elena Ríos"));

        List<UUID> students = List.of(
                register(student("ana@idea.edu", "Ana Gómez")),
                register(student("luis@idea.edu", "Luis Hernández")),
                register(student("maria@idea.edu", "María Torres")),
                register(student("carlos@idea.edu", "Carlos Méndez")),
                register(student("sofia@idea.edu", "Sofía Ramírez")),
                register(student("diego@idea.edu", "Diego Castro")));

        UUID math = subjectId(subject("Matemáticas", AcademicLevel.HIGH_SCHOOL));
        UUID physics = subjectId(subject("Física", AcademicLevel.HIGH_SCHOOL));
        UUID history = subjectId(subject("Historia", AcademicLevel.SECONDARY));
        UUID biology = subjectId(subject("Biología", AcademicLevel.SECONDARY));
        UUID programming = subjectId(subject("Programación", AcademicLevel.UNIVERSITY));

        UUID algebra = examService.createExam(
                exam("Examen de Álgebra", math,
                        "Operaciones con expresiones algebraicas básicas.", true, students,
                        single(0, "¿Cuál es el resultado de 2x + 3x?", DifficultyLevel.LOW, 1,
                                option("5x", true), option("6x", false),
                                option("5x²", false), option("23x", false)),
                        single(1, "¿Cuánto vale x en 2x = 10?", DifficultyLevel.LOW, 1,
                                option("5", true), option("8", false), option("20", false)),
                        multiple(2, "¿Cuáles de los siguientes son números primos?",
                                DifficultyLevel.MEDIUM, 2,
                                option("2", true), option("3", true),
                                option("4", false), option("9", false)),
                        trueFalse(3, "El cuadrado de un número negativo es positivo.",
                                true, DifficultyLevel.MEDIUM, 1),
                        shortText(4, "Explica con tus palabras qué es una ecuación.",
                                DifficultyLevel.HIGH, 3)),
                teacher);

        UUID kinematics = examService.createExam(
                exam("Cinemática básica", physics,
                        "Movimiento rectilíneo uniforme y conceptos de velocidad.", true, students,
                        single(0, "La velocidad se define como…", DifficultyLevel.LOW, 1,
                                option("Distancia entre tiempo", true),
                                option("Masa por aceleración", false),
                                option("Fuerza entre área", false)),
                        trueFalse(1, "En un MRU la aceleración es cero.",
                                true, DifficultyLevel.MEDIUM, 1),
                        shortText(2, "Describe un ejemplo cotidiano de movimiento acelerado.",
                                DifficultyLevel.MEDIUM, 2)),
                teacher);

        examService.createExam(
                exam("La Revolución Mexicana", history,
                        "Causas y personajes principales (1910-1920).", true, students,
                        single(0, "¿En qué año inició la Revolución Mexicana?",
                                DifficultyLevel.LOW, 1,
                                option("1910", true), option("1810", false), option("1920", false)),
                        multiple(1, "Selecciona los líderes revolucionarios.",
                                DifficultyLevel.MEDIUM, 2,
                                option("Emiliano Zapata", true), option("Francisco Villa", true),
                                option("Porfirio Díaz", false))),
                teacher);

        examService.createExam(
                exam("Célula y genética", biology,
                        "Estructura celular y herencia.", true, students,
                        single(0, "El orgánulo encargado de producir energía es…",
                                DifficultyLevel.MEDIUM, 1,
                                option("La mitocondria", true), option("El ribosoma", false),
                                option("El núcleo", false)),
                        trueFalse(1, "El ADN se encuentra en el núcleo de la célula.",
                                true, DifficultyLevel.LOW, 1)),
                teacher);

        // A draft (unpublished) exam, so the dashboard shows both states.
        examService.createExam(
                exam("Fundamentos de Programación", programming,
                        "Borrador: variables, tipos y control de flujo.", false, List.of(),
                        single(0, "¿Qué estructura repite un bloque de código?",
                                DifficultyLevel.LOW, 1,
                                option("Un bucle", true), option("Una variable", false),
                                option("Un comentario", false)),
                        shortText(1, "¿Para qué sirve una función?", DifficultyLevel.MEDIUM, 2)),
                teacher);

        // Submissions: some students take the published exams (mixed scores), which
        // produces graded results and short-text answers pending manual review.
        submit(algebra, students.get(0), true);
        submit(algebra, students.get(1), false);
        submit(algebra, students.get(2), true);
        submit(kinematics, students.get(0), true);
        submit(kinematics, students.get(3), false);

        log.info("Demo seed complete: 1 teacher, {} students, 5 subjects, 5 exams.", students.size());
    }

    private UUID register(RegisterRequest request) {
        return authService.register(request).user().userId();
    }

    private UUID subjectId(com.idea.exam.dto.SubjectRequest request) {
        return subjectService.create(request).subjectIdentifier();
    }

    /**
     * Submits an attempt for {@code studentId}: when {@code allCorrect} the
     * student picks every right option, otherwise one wrong option per question.
     * Short-text answers always carry sample text (left pending manual review).
     */
    private void submit(UUID examId, UUID studentId, boolean allCorrect) {
        GradingExam exam = examService.getGradingExam(examId);
        List<AnswerSubmission> answers = new ArrayList<>();
        for (var question : exam.questions()) {
            if (question.questionType() == QuestionType.SHORT_TEXT) {
                answers.add(new AnswerSubmission(
                        question.questionId(), List.of(),
                        "Una ecuación es una igualdad entre dos expresiones con incógnitas."));
                continue;
            }
            List<UUID> chosen = allCorrect
                    ? new ArrayList<>(question.correctOptionIds())
                    : question.options().stream()
                            .filter(o -> !o.correct())
                            .map(GradingOption::optionId)
                            .limit(1)
                            .toList();
            answers.add(new AnswerSubmission(question.questionId(), chosen, null));
        }
        attemptService.submit(examId, studentId, new SubmitAttemptRequest(answers));
    }
}
