import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUrlUser1751303399328 implements MigrationInterface {
    name = 'AddUrlUser1751303399328';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "urls" ADD "user_id" integer`);
        await queryRunner.query(
            `ALTER TABLE "urls" ADD CONSTRAINT "FK_5b194a4470977b71ff490dfc64b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "urls" DROP CONSTRAINT "FK_5b194a4470977b71ff490dfc64b"`,
        );
        await queryRunner.query(`ALTER TABLE "urls" DROP COLUMN "user_id"`);
    }
}
