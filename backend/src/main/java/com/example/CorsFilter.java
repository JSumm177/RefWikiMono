package com.example;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebFilter("/*")
public class CorsFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse res = (HttpServletResponse) response;
        HttpServletRequest req = (HttpServletRequest) request;

        String origin = req.getHeader("Origin");
        String allowedOriginsEnv = getAllowedOrigins();
        
        if (origin != null && allowedOriginsEnv != null && !allowedOriginsEnv.isEmpty()) {
            String[] origins = allowedOriginsEnv.split(",");
            boolean isAllowed = false;
            for (String o : origins) {
                String trimmed = o.trim();
                if (trimmed.equals("*") || trimmed.equalsIgnoreCase(origin)) {
                    isAllowed = true;
                    break;
                }
            }
            if (isAllowed) {
                res.setHeader("Access-Control-Allow-Origin", origin);
            }
        }

        res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Client-Platform");
        res.setHeader("Access-Control-Allow-Credentials", "true");

        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);
            return; // Don't continue the chain for OPTIONS
        } else {
            chain.doFilter(request, response);
        }
    }

    protected String getAllowedOrigins() {
        return System.getenv("ALLOWED_ORIGINS");
    }

    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void destroy() {}
}
