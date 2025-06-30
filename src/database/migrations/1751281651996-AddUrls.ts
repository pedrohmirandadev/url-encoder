import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUrls1751281651996 implements MigrationInterface {
    name = 'AddUrls1751281651996';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "urls" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "code" character varying NOT NULL, "visit_quantity" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_a7b51de2dd9fc9fddb1e2453b98" UNIQUE ("code"), CONSTRAINT "PK_eaf7bec915960b26aa4988d73b0" PRIMARY KEY ("id"))`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "urls"`);
    }
}
