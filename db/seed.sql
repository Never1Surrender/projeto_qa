-- Dados de exemplo para desenvolvimento/QA manual.
-- Não roda automaticamente (init.sql já cobre o schema + dados mínimos).
-- Para aplicar: docker exec -i adocao_mariadb mariadb -u adocao_user -padocao_pass adocao_animais < db/seed.sql

INSERT INTO cidades (nome, estado) VALUES
  ('Fortaleza', 'CE'),
  ('Salvador', 'BA'),
  ('Brasília', 'DF')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

INSERT INTO racas (nome, especie_id) VALUES
  ('Bulldog Francês', (SELECT id FROM especies WHERE nome = 'Cachorro')),
  ('Maine Coon', (SELECT id FROM especies WHERE nome = 'Gato')),
  ('Canário', (SELECT id FROM especies WHERE nome = 'Ave'))
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

INSERT INTO adotantes (nome, cpf, telefone, email, cidade_id) VALUES
  ('Ana Beatriz Souza', '66935492335', '11987654321', 'ana.souza@email.com', (SELECT id FROM cidades WHERE nome = 'São Paulo')),
  ('Bruno Costa Lima', '17997211322', '21976543210', 'bruno.lima@email.com', (SELECT id FROM cidades WHERE nome = 'Rio de Janeiro')),
  ('Carla Mendes', '07690750613', '31965432109', NULL, (SELECT id FROM cidades WHERE nome = 'Belo Horizonte')),
  ('Diego Ferreira', '70009878394', NULL, 'diego.f@email.com', (SELECT id FROM cidades WHERE nome = 'Curitiba')),
  ('Elaine Rodrigues', '70607674105', '85954321098', 'elaine.r@email.com', (SELECT id FROM cidades WHERE nome = 'Fortaleza')),
  ('Fabio Almeida', '39020850296', '71943210987', NULL, NULL),
  ('Gabriela Santos', '47469025421', NULL, 'gabi.santos@email.com', (SELECT id FROM cidades WHERE nome = 'Brasília')),
  ('Henrique Barbosa', '47151558422', '51932109876', 'henrique.b@email.com', (SELECT id FROM cidades WHERE nome = 'Porto Alegre'))
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

INSERT INTO animais (nome, especie_id, raca_id, data_nascimento, cidade_id) VALUES
  ('Rex', (SELECT id FROM especies WHERE nome = 'Cachorro'),
    (SELECT id FROM racas WHERE nome = 'Labrador'),
    '2022-03-15', (SELECT id FROM cidades WHERE nome = 'São Paulo')),
  ('Luna', (SELECT id FROM especies WHERE nome = 'Gato'),
    (SELECT id FROM racas WHERE nome = 'Persa'),
    '2021-07-22', (SELECT id FROM cidades WHERE nome = 'Rio de Janeiro')),
  ('Thor', (SELECT id FROM especies WHERE nome = 'Cachorro'),
    (SELECT id FROM racas WHERE nome = 'Vira-lata' AND especie_id = (SELECT id FROM especies WHERE nome = 'Cachorro')),
    '2023-01-10', (SELECT id FROM cidades WHERE nome = 'Belo Horizonte')),
  ('Mel', (SELECT id FROM especies WHERE nome = 'Coelho'),
    (SELECT id FROM racas WHERE nome = 'Mini Lop'),
    '2023-05-30', (SELECT id FROM cidades WHERE nome = 'Curitiba')),
  ('Kiwi', (SELECT id FROM especies WHERE nome = 'Ave'),
    (SELECT id FROM racas WHERE nome = 'Calopsita'),
    '2022-11-02', (SELECT id FROM cidades WHERE nome = 'Fortaleza')),
  ('Bidu', (SELECT id FROM especies WHERE nome = 'Cachorro'),
    (SELECT id FROM racas WHERE nome = 'Bulldog Francês'),
    '2020-09-18', (SELECT id FROM cidades WHERE nome = 'Salvador')),
  ('Mia', (SELECT id FROM especies WHERE nome = 'Gato'),
    (SELECT id FROM racas WHERE nome = 'Vira-lata' AND especie_id = (SELECT id FROM especies WHERE nome = 'Gato')),
    '2021-12-05', (SELECT id FROM cidades WHERE nome = 'Brasília')),
  ('Tuca', (SELECT id FROM especies WHERE nome = 'Réptil'),
    (SELECT id FROM racas WHERE nome = 'Jabuti'),
    '2019-04-25', (SELECT id FROM cidades WHERE nome = 'Porto Alegre'));

-- Marca 3 animais como já adotados, vinculando a adotantes acima, e registra
-- o histórico correspondente em `adocoes` (senão fica um status "adotado"
-- sem nenhuma adoção no histórico, uma inconsistência de dados)
UPDATE animais SET status = 'adotado', adotante_id = (SELECT id FROM adotantes WHERE cpf = '66935492335')
  WHERE nome = 'Rex';
INSERT INTO adocoes (animal_id, adotante_id)
  VALUES ((SELECT id FROM animais WHERE nome = 'Rex'), (SELECT id FROM adotantes WHERE cpf = '66935492335'));

UPDATE animais SET status = 'adotado', adotante_id = (SELECT id FROM adotantes WHERE cpf = '70009878394')
  WHERE nome = 'Mel';
INSERT INTO adocoes (animal_id, adotante_id)
  VALUES ((SELECT id FROM animais WHERE nome = 'Mel'), (SELECT id FROM adotantes WHERE cpf = '70009878394'));

UPDATE animais SET status = 'adotado', adotante_id = (SELECT id FROM adotantes WHERE cpf = '47151558422')
  WHERE nome = 'Tuca';
INSERT INTO adocoes (animal_id, adotante_id)
  VALUES ((SELECT id FROM animais WHERE nome = 'Tuca'), (SELECT id FROM adotantes WHERE cpf = '47151558422'));
