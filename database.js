// database.js
const Database = require('better-sqlite3');

// Cria ou abre o banco de dados
const db = new Database('armarios.db', { verbose: console.log });

// Função para inicializar o banco de dados
function inicializarBancoDeDados() {
  try {
    db.exec(`
      -- Tabela principal para armários padrão
      CREATE TABLE IF NOT EXISTS armarios (
          id INTEGER PRIMARY KEY,
          nome TEXT,
          prontuario TEXT,
          objetos TEXT,
          recebido_por TEXT,
          status TEXT CHECK(status IN ('emprestado', 'devolvido-total')),
          data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de histórico para armários padrão
      CREATE TABLE IF NOT EXISTS historico_armarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          armario_id INTEGER,
          data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status TEXT,
          nome TEXT,
          prontuario TEXT,
          objetos TEXT,
          recebido_por TEXT,
          FOREIGN KEY (armario_id) REFERENCES armarios(id)
      );

      -- Tabela para armários temporizados
      CREATE TABLE IF NOT EXISTS armarios_temporizados (
          id INTEGER PRIMARY KEY,
          nome TEXT,
          prontuario TEXT,
          status TEXT CHECK(status IN ('emprestado', 'devolvido')),
          timestamp_inicio INTEGER,
          timestamp_fim INTEGER,
          data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de histórico para armários temporizados
      CREATE TABLE IF NOT EXISTS historico_temporizados (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          armario_id INTEGER,
          data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status TEXT,
          nome TEXT,
          prontuario TEXT,
          FOREIGN KEY (armario_id) REFERENCES armarios_temporizados(id)
      );

      -- Tabela para armários de valores
      CREATE TABLE IF NOT EXISTS armarios_valores (
          id INTEGER PRIMARY KEY,
          nome TEXT,
          prontuario TEXT,
          itens TEXT,
          devolver_para TEXT,
          status TEXT CHECK(status IN ('guardado', 'devolvido')),
          data_guardado TIMESTAMP,
          data_devolvido TIMESTAMP
      );

      -- Tabela de histórico para armários de valores
      CREATE TABLE IF NOT EXISTS historico_valores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          armario_id INTEGER,
          data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status TEXT,
          nome TEXT,
          prontuario TEXT,
          itens TEXT,
          devolver_para TEXT,
          FOREIGN KEY (armario_id) REFERENCES armarios_valores(id)
      );

      -- Tabela para itens esquecidos
      CREATE TABLE IF NOT EXISTS itens_esquecidos (
          id INTEGER PRIMARY KEY,
          nome TEXT,
          prontuario TEXT,
          itens TEXT,
          data_guardado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          data_vencimento TIMESTAMP GENERATED ALWAYS AS (datetime(data_guardado, '+30 days')) STORED,
          status TEXT GENERATED ALWAYS AS (
              CASE 
                  WHEN datetime('now') < datetime(data_guardado, '+30 days') THEN 'ativo'
                  ELSE 'vencido'
              END
          ) STORED
      );
    `);

db.prepare(`
  CREATE TABLE IF NOT EXISTS itens_esquecidos (
    id INTEGER PRIMARY KEY,
    nome TEXT,
    prontuario TEXT,
    itens TEXT,
    data INTEGER
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS armarios_valores (
    id INTEGER PRIMARY KEY,
    nome TEXT,
    prontuario TEXT,
    itens TEXT,
    devolver TEXT,
    data INTEGER
  )
`).run();

    
    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  }
}

// Exporta as funções e a conexão com o banco de dados
module.exports = {
  db,
  inicializarBancoDeDados
};