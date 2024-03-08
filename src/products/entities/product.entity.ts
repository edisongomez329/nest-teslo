import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";


@Entity({name: 'products'})
export class Product {

    @ApiProperty({ 
        example: '13a7e5a1-4c85-4ada-a1c5-68a480eeee95',
        description: 'Product Id',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ 
        example: 'T-shirt s',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', { 
        unique: true
    })
    title: string;

    @ApiProperty({ 
        example: '0',
        description: 'Product Price'        
    })    
    @ApiProperty()
    @Column('float')
    price: number;

    @ApiProperty()
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty()
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty()
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty()
    @Column('text', {
        array: true
    })
    sizes: string[]

    @ApiProperty()
    @Column('text')
    gender: string;

    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    
    @ApiProperty({ 
        example: [
            'https://image1.jpg',
            'https://image2.jpg',
            'https://image3.jpg'
        ],
        description: 'Product images',
    })
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[]

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User

    @BeforeInsert()
    checkSlugInsert() {
        
        if(!this.slug) {
            this.slug = this.title;;
        }

        this.slug = this.slug.toLocaleLowerCase().replaceAll(' ', '_').replaceAll("'", '');
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug.toLocaleLowerCase()
                             .replaceAll(' ', '_')
                             .replaceAll("'", '');
    }

}
