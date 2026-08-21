CREATE DATABASE IF NOT EXISTS `gestione_abiti`
  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

USE `gestione_abiti`;

DROP TABLE IF EXISTS `capo_categoria`;
DROP TABLE IF EXISTS `capo`;
DROP TABLE IF EXISTS `categoria`;

CREATE TABLE `capo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descrizione` text DEFAULT NULL,
  `prezzo` float NOT NULL,
  `taglia` varchar(255) NOT NULL,
  `disponibile` tinyint(1) DEFAULT 1,
  `quantita` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `categoria` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descrizione` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `capo_categoria` (
  `capo_id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  PRIMARY KEY (`capo_id`,`categoria_id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `capo_categoria_ibfk_1` FOREIGN KEY (`capo_id`)
    REFERENCES `capo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `capo_categoria_ibfk_2` FOREIGN KEY (`categoria_id`)
    REFERENCES `categoria` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
