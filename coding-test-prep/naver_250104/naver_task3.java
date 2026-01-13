package com.codility.aop.aspects;

import com.codility.aop.log.*;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
public class LoggingAspect {

    private final LogFacade logFacade;

    // Pointcut Constants
    private static final String POINTCUT_DATE_SERVICE_NEXT_DATE = 
            "execution(* com.codility.aop.date.DateService.getNextDate(..))";
    private static final String POINTCUT_REPO_SAVE = 
            "execution(* com.codility.aop.date.DateRepository.save(..)) || " +
            "execution(* com.codility.aop.calendar.MeetingRepository.save(..))";
    private static final String POINTCUT_DB_CONNECTIVITY_SAVE = 
            "execution(* com.codility.aop.database.DatabaseConnectivity.save(..))";

    public LoggingAspect(LogFacade logFacade) {
        this.logFacade = logFacade;
    }

    // -- Pointcuts --

    @Pointcut(POINTCUT_DATE_SERVICE_NEXT_DATE)
    private void dateServiceGetNextDate() {}

    @Pointcut(POINTCUT_REPO_SAVE)
    private void repositorySaveMethods() {}

    // -- Advice --

    /**
     * Log invocation of each method annotated with @Log.
     */
    @Around("@annotation(com.codility.aop.annotations.Log)")
    public Object logMethodInvocation(ProceedingJoinPoint joinPoint) throws Throwable {
        logFacade.logInvocation(new InvocationLogDto(
            getClassName(joinPoint), 
            getMethodName(joinPoint), 
            Arrays.asList(joinPoint.getArgs())
        ));

        return joinPoint.proceed();
    }

    /**
     * Log return value of DateService.getNextDate method.
     */
    @AfterReturning(pointcut = "dateServiceGetNextDate()", returning = "result")
    public void logDateServiceReturnValue(JoinPoint joinPoint, Object result) {
        logFacade.logReturnValue(new ReturnLogDto(
            getClassName(joinPoint), 
            getMethodName(joinPoint), 
            result
        ));
    }

    /**
     * Log exception thrown by DateService.getNextDate method.
     */
    @AfterThrowing(pointcut = "dateServiceGetNextDate()", throwing = "exception")
    public void logDateServiceException(JoinPoint joinPoint, Exception exception) {
        logFacade.logThrownException(new ExceptionLogDto(
            getClassName(joinPoint), 
            getMethodName(joinPoint), 
            exception
        ));
    }

    /**
     * Log objects saved using DateRepository.save or MeetingRepository.save.
     * Changed from @After to @AfterReturning to ensure we only log on successful saves.
     */
    @AfterReturning("repositorySaveMethods()")
    public void logSavedEntity(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        if (args == null || args.length == 0) {
            return;
        }

        logFacade.logEntitySave(new EntitySaveLogDto(
            getClassName(joinPoint), 
            args[0]
        ));
    }

    /**
     * Log execution time of DatabaseConnectivity.save method.
     * Log only when execution was successful.
     */
    @Around(POINTCUT_DB_CONNECTIVITY_SAVE)
    public Object logDatabaseConnectivitySaveTime(ProceedingJoinPoint joinPoint) throws Throwable {
        Object[] args = joinPoint.getArgs();
        Object entity = (args != null && args.length > 0) ? args[0] : null;

        // Use nanoTime for precision
        long startNano = System.nanoTime();
        
        // proceed() will throw if the underlying method throws.
        // In that case, lines below are skipped, satisfying "no logging on exception".
        Object result = joinPoint.proceed();
        
        // Convert nano to millis for the DTO
        long executionTimeMillis = (System.nanoTime() - startNano) / 1_000_000;

        logFacade.logEntitySavingTime(new EntitySaveTimeLogDto(
            getClassName(joinPoint), 
            entity, 
            executionTimeMillis
        ));

        return result;
    }

    // -- Helper Methods --

    private String getClassName(JoinPoint joinPoint) {
        // Use getDeclaringTypeName() to avoid CGLIB proxy names (e.g., DateService$$EnhancerBySpringCGLIB...)
        return joinPoint.getSignature().getDeclaringTypeName();
    }

    private String getMethodName(JoinPoint joinPoint) {
        return joinPoint.getSignature().getName();
    }
}