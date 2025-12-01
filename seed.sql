INSERT INTO doctors (id, name, email, phone, textit_uuid, created_at, updated_at)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Test Doctor', 'test@example.com', '1234567890', 'test-uuid', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
