import { Users } from '../../users/entities/users.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
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

    @ManyToOne(() => Users, (user) => user.urls)
    @JoinColumn({ name: 'user_id' })
    user: Users;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
