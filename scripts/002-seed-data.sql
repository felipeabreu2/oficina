-- Insert sample company
INSERT INTO companies (id, name, document, email, phone, address) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Oficina AutoGest Pro', '12.345.678/0001-90', 'contato@autogestpro.com', '(11) 3456-7890', 'Rua das Oficinas, 123 - Centro');

-- Insert sample user
INSERT INTO users (company_id, name, email, password_hash, role) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Administrador', 'admin@autogestpro.com', '$2b$10$rOvHPnuKJ5PZkKJ5PZkKJ5PZkKJ5PZkKJ5PZkKJ5PZkKJ5PZkKJ5PZ', 'ADMIN');

-- Insert sample products
INSERT INTO products (company_id, code, type, brand, model, size, price, cost_price, stock, min_stock, condition_rating) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'P001', 'PNEU_NOVO', 'Michelin', 'Energy XM2', '185/65R15', 280.00, 200.00, 8, 5, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'P002', 'PNEU_USADO', 'Pirelli', 'P7', '185/65R15', 120.00, 80.00, 1, 3, 7),
('550e8400-e29b-41d4-a716-446655440000', 'P003', 'PNEU_NOVO', 'Goodyear', 'EfficientGrip', '175/70R14', 250.00, 180.00, 12, 5, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'P004', 'PECAS_UTENSILIOS', 'Bosch', 'Filtro de Óleo', 'Universal', 35.00, 20.00, 15, 10, NULL),
('550e8400-e29b-41d4-a716-446655440000', 'P005', 'PNEU_REMOLD', 'BS Pneus', 'City Tour', '175/70R14', 180.00, 120.00, 6, 5, NULL);

-- Insert sample clients
INSERT INTO clients (company_id, code, name, document, phone, email, address, total_spent, last_purchase) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'C001', 'João Silva', '123.456.789-00', '(11) 99999-9999', 'joao.silva@email.com', 'Rua das Flores, 123 - Centro', 1250.00, '2024-01-10'),
('550e8400-e29b-41d4-a716-446655440000', 'C002', 'Transportadora ABC Ltda', '12.345.678/0001-90', '(11) 88888-8888', 'contato@transportadoraabc.com.br', 'Av. Industrial, 500 - Distrito Industrial', 15800.00, '2024-01-08');

-- Insert sample vehicles
INSERT INTO vehicles (company_id, client_id, plate, brand, model, year, front_tires, rear_tires) VALUES 
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM clients WHERE code = 'C001'), 'ABC-1234', 'Honda', 'Civic', 2020, '185/65R15', '185/65R15'),
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM clients WHERE code = 'C002'), 'XYZ-5678', 'Mercedes', 'Sprinter', 2019, '215/75R16', '215/75R16');

-- Insert sample accounts payable
INSERT INTO accounts_payable (company_id, supplier_name, description, category, value, due_date, status) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Fornecedor ABC', 'Compra de pneus', 'Compra de Mercadorias', 5000.00, '2024-01-22', 'PENDENTE'),
('550e8400-e29b-41d4-a716-446655440000', 'Energia Elétrica', 'Conta de luz', 'Despesas Operacionais', 450.00, '2024-01-28', 'PENDENTE'),
('550e8400-e29b-41d4-a716-446655440000', 'Aluguel', 'Aluguel do imóvel', 'Despesas Fixas', 2800.00, '2024-01-30', 'PENDENTE');
