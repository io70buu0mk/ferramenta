-- Aggiunge la colonna 'status' alla tabella 'products' se non esiste
ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';
