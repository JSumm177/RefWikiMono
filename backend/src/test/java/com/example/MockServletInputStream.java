package com.example;

import javax.servlet.ReadListener;
import javax.servlet.ServletInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;

public class MockServletInputStream extends ServletInputStream {

    private final ByteArrayInputStream inputStream;

    public MockServletInputStream(ByteArrayInputStream inputStream) {
        this.inputStream = inputStream;
    }

    @Override
    public boolean isFinished() {
        return inputStream.available() == 0;
    }

    @Override
    public boolean isReady() {
        return true;
    }

    @Override
    public void setReadListener(ReadListener readListener) {
        // Not implemented for mock
    }

    @Override
    public int read() throws IOException {
        return inputStream.read();
    }
}