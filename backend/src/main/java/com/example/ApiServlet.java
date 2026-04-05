package com.example;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@WebServlet("/data")
public class ApiServlet extends HttpServlet {
    private static final Logger logger = LoggerFactory.getLogger(ApiServlet.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();
        ApiResponse responseJson = new ApiResponse();

        try (Connection conn = DatabaseConfig.getDataSource().getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT name FROM items LIMIT 1");
             ResultSet rs = stmt.executeQuery()) {

            String itemName = "No data found";
            if (rs.next()) {
                itemName = rs.getString("name");
            }

            responseJson.message = "Connected to MySQL!";
            responseJson.data = itemName;
            out.print(objectMapper.writeValueAsString(responseJson));

        } catch (Exception e) {
            logger.error("Error fetching data", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            responseJson.error = "An internal error occurred.";
            out.print(objectMapper.writeValueAsString(responseJson));
        }
        out.flush();
    }
}
