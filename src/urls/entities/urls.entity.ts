import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Urls {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @Column({ unique: true })
    code: string;

    @Column({ default: 0 })
    visit_quantity: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
