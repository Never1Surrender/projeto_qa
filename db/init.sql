CREATE TABLE IF NOT EXISTS cidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  estado CHAR(2) NOT NULL,
  UNIQUE KEY uq_cidade_nome_estado (nome, estado)
);

INSERT INTO cidades (nome, estado) VALUES
  ('São Paulo', 'SP'),
  ('Rio de Janeiro', 'RJ'),
  ('Belo Horizonte', 'MG'),
  ('Curitiba', 'PR'),
  ('Porto Alegre', 'RS');

CREATE TABLE IF NOT EXISTS especies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO especies (nome) VALUES
  ('Cachorro'), ('Gato'), ('Ave'), ('Coelho'), ('Réptil'), ('Outro');

CREATE TABLE IF NOT EXISTS racas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  especie_id INT NOT NULL,
  UNIQUE KEY uq_raca_especie (nome, especie_id),
  CONSTRAINT fk_raca_especie FOREIGN KEY (especie_id) REFERENCES especies(id)
);

INSERT INTO racas (nome, especie_id) VALUES
  ('Labrador', 1), ('Poodle', 1), ('Vira-lata', 1),
  ('Persa', 2), ('Siamês', 2), ('Vira-lata', 2),
  ('Calopsita', 3), ('Periquito', 3),
  ('Mini Lop', 4),
  ('Jabuti', 5);

CREATE TABLE IF NOT EXISTS adotantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  telefone VARCHAR(11) NULL,
  email VARCHAR(150) NULL,
  cidade_id INT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_adotante_cidade FOREIGN KEY (cidade_id) REFERENCES cidades(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS animais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  especie_id INT NOT NULL,
  raca_id INT NULL,
  data_nascimento DATE,
  status ENUM('disponivel', 'adotado') NOT NULL DEFAULT 'disponivel',
  adotante_id INT NULL,
  cidade_id INT NULL,
  foto_url VARCHAR(500) NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_animal_adotante FOREIGN KEY (adotante_id) REFERENCES adotantes(id) ON DELETE SET NULL,
  CONSTRAINT fk_animal_cidade FOREIGN KEY (cidade_id) REFERENCES cidades(id) ON DELETE SET NULL,
  CONSTRAINT fk_animal_especie FOREIGN KEY (especie_id) REFERENCES especies(id),
  CONSTRAINT fk_animal_raca FOREIGN KEY (raca_id) REFERENCES racas(id) ON DELETE SET NULL
);
