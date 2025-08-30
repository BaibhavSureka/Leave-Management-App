-- Leave Management Application Seed Data
-- Run this AFTER schema.sql in Supabase SQL Editor

-- Insert default leave types
INSERT INTO leave_types (name, active) VALUES
('Annual Leave', true),
('Sick Leave', true),
('Personal Leave', true),
('Maternity Leave', true),
('Paternity Leave', true),
('Comp Off', true),
('Gift Leave', true),
('Emergency Leave', true),
('Study Leave', false),
('Sabbatical', false);

-- Insert sample projects
INSERT INTO projects (name, active) VALUES
('Project Alpha', true),
('Project Beta', true),
('Project Gamma', true),
('Internal Operations', true),
('Client Support', true),
('Research & Development', true),
('Marketing Campaign', true),
('Legacy System Migration', false);

-- Insert sample regions
INSERT INTO regions (name, active) VALUES
('North America', true),
('Europe', true),
('Asia Pacific', true),
('Latin America', true),
('Middle East & Africa', true),
('India', true),
('Remote', true),
('Headquarters', false);

-- Insert sample groups/teams
INSERT INTO groups (name, active) VALUES
('Engineering', true),
('Product Management', true),
('Design', true),
('Marketing', true),
('Sales', true),
('Customer Support', true),
('Human Resources', true),
('Finance', true),
('Operations', true),
('Quality Assurance', true),
('DevOps', true),
('Security', true),
('Analytics', false);

-- Note: User profiles will be created automatically when users first log in
-- You'll need to manually update a user's role to 'ADMIN' and 'MANAGER' after they first log in
-- Example:
-- UPDATE profiles SET role = 'ADMIN' WHERE email = 'your-admin-email@gmail.com';
-- UPDATE profiles SET role = 'MANAGER' WHERE email = 'your-manager-email@gmail.com';
