package com.codility.aop.aspects;

import com.codility.aop.log.*;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Aspect
@Component
public class LoggingAspect {

    private final LogFacade logFacade;

    public LoggingAspect(LogFacade logFacade) {
        this.logFacade = logFacade;
    }

    /**
     * Log invocation of each method annotated with @Log.
     */
    @Around("@annotation(com.codility.aop.annotations.Log)")
    public Object logMethodInvocation(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getTarget().getClass().getName();
        String methodName = joinPoint.getSignature().getName();
        List<Object> args = Arrays.asList(joinPoint.getArgs());

        logFacade.logInvocation(new InvocationLogDto(className, methodName, args));

        return joinPoint.proceed();
    }

    /**
     * Log return value of DateService.getNextDate method.
     * Note: Requirement text said 'logInvocation', but 'logReturnValue' is semantically correct and matches previous code hints.
     */
    @AfterReturning(pointcut = "execution(* com.codility.aop.date.DateService.getNextDate(..))", returning = "result")
    public void logDateServiceReturnValue(JoinPoint joinPoint, Object result) {
        String className = joinPoint.getTarget().getClass().getName();
        String methodName = joinPoint.getSignature().getName();

        logFacade.logReturnValue(new ReturnLogDto(className, methodName, result));
    }

    /**
     * Log exception thrown by DateService.getNextDate method.
     */
    @AfterThrowing(pointcut = "execution(* com.codility.aop.date.DateService.getNextDate(..))", throwing = "exception")
    public void logDateServiceException(JoinPoint joinPoint, Exception exception) {
        String className = joinPoint.getTarget().getClass().getName();
        String methodName = joinPoint.getSignature().getName();

        logFacade.logThrownException(new ExceptionLogDto(className, methodName, exception));
    }

    /**
     * Log objects saved using DateRepository.save or MeetingRepository.save.
     * Safe checks added for arguments.
     */
    @After("execution(* com.codility.aop.date.DateRepository.save(..)) || " +
           "execution(* com.codility.aop.calendar.MeetingRepository.save(..))")
    public void logSavedEntity(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        if (args == null || args.length == 0) {
            return;
        }

        String className = joinPoint.getTarget().getClass().getName();
        Object entity = args[0];

        // Note: Requirement text said 'logSavedEntity', but 'logEntitySave' matches previous code hints.
        logFacade.logEntitySave(new EntitySaveLogDto(className, entity));
    }

    /**
     * Log execution time of DatabaseConnectivity.save method.
     * Log only when execution was successful.
     */
    @Around("execution(* com.codility.aop.database.DatabaseConnectivity.save(..))")
    public Object logDatabaseConnectivitySaveTime(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getTarget().getClass().getName();
        Object[] args = joinPoint.getArgs();
        Object entity = (args != null && args.length > 0) ? args[0] : null;

        long startTime = System.currentTimeMillis();
        
        // proceed() will throw if the underlying method throws.
        // In that case, lines below are skipped, satisfying "no logging on exception".
        Object result = joinPoint.proceed();
        
        long executionTime = System.currentTimeMillis() - startTime;

        logFacade.logEntitySavingTime(new EntitySaveTimeLogDto(className, entity, executionTime));

        return result;
    }
}
