package com.example;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet("/data")
public class ApiServlet extends HttpServlet {
    private static final Logger logger = Logger.getLogger(ApiServlet.class.getName());
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();
        ObjectNode responseJson = objectMapper.createObjectNode();

        try (Connection conn = DatabaseConfig.getDataSource().getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT name FROM items LIMIT 1");
             ResultSet rs = stmt.executeQuery()) {

            String itemName = "No data found";
            if (rs.next()) {
                itemName = rs.getString("name");
            }

            responseJson.put("message", "Connected to MySQL!");
            responseJson.put("data", itemName);
            out.print(objectMapper.writeValueAsString(responseJson));

        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error fetching data", e);
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            responseJson.put("error", "An internal error occurred.");
            out.print(objectMapper.writeValueAsString(responseJson));
        }
        out.flush();
    }
}
