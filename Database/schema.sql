-- Truman Virtual Tour Database Schema
-- Created: October 14, 2025
-- Purpose: Placeholder for future database implementation

-- Users table for tracking virtual tour visitors
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tour_duration INTEGER DEFAULT 0,
    pages_visited INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tour analytics table
CREATE TABLE IF NOT EXISTS tour_analytics (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) REFERENCES users(session_id),
    page_name VARCHAR(100) NOT NULL,
    time_spent INTEGER DEFAULT 0,
    interactions_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campus locations table (for future expansion)
CREATE TABLE IF NOT EXISTS campus_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    coordinates POINT,
    skybox_images JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) REFERENCES users(session_id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON tour_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON tour_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
