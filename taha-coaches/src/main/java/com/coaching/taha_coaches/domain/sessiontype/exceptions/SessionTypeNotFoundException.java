package com.coaching.taha_coaches.domain.sessiontype.exceptions;

public class SessionTypeNotFoundException extends RuntimeException {
    public SessionTypeNotFoundException() {
        super("error.sessionType.notFound");
    }
}
