import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUrl1751046136098 implements MigrationInterface {
    name = 'AddUrl1751046136098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "url" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "code" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_1ec820b835ce9c4bc6cc8a01d98" UNIQUE ("code"), CONSTRAINT "PK_7421088122ee64b55556dfc3a91" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "url"`);
    }

}
