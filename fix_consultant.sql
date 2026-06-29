CREATE TABLE IF NOT EXISTS `pet_atlas`.`consultant_team_members` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `listing_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `role` VARCHAR(255) DEFAULT 'responder',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
