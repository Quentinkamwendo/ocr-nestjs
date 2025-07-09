import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewMigration1737026739172 implements MigrationInterface {
  name = 'NewMigration1737026739172';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`image\` (\`id\` varchar(36) NOT NULL, \`filename\` varchar(255) NOT NULL, \`originalName\` varchar(255) NOT NULL, \`path\` varchar(255) NOT NULL, \`keywords\` varchar(255) NOT NULL, \`extractedText\` text NOT NULL, \`status\` enum ('accepted', 'rejected') NOT NULL DEFAULT 'rejected', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`image\``);
  }
}
