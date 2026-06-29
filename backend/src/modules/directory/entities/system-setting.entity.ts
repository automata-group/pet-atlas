import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('system_settings')
export class SystemSetting {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  key: string;

  @Column({ type: 'varchar', length: 255 })
  value: string;
}
