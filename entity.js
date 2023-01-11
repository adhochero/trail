import { AnimatedSprite } from "./animatedSprite.js";

export class Entity{
    constructor(keys){
        this.keys = keys;
        this.isMine = false;
        this.id = 'default';

        this.inputDirection = {x: 0, y: 0};
        this.inputSmoothing = {x: 0, y: 0};
        this.velocity = {x: 0, y: 0};
        this.moveDirection = {x: 0, y: 0};
        this.position = {x: 333, y: 250};
        this.inputResponsiveness = 8;
        this.moveSpeed = 200;

        this.sprite = new AnimatedSprite(
            document.getElementById('player'),
            8, //scale
            0, //position.x,
            0, //position.y,
            5, //total columns
            3, //total rows
            2, //current row
            5, //frames on row
            0.12, //sec per frame
            false
        );
    }

    update(secondsPassed){
        if(this.isMine){
            //get input direction
            if((this.keys.includes('a') || this.keys.includes('arrowleft')) && (!this.keys.includes('d') && !this.keys.includes('arrowright'))) this.inputDirection.x = -1;
            else if((this.keys.includes('d') || this.keys.includes('arrowright')) && (!this.keys.includes('a') && !this.keys.includes('arrowleft'))) this.inputDirection.x = 1;
            else this.inputDirection.x = 0;
    
            if((this.keys.includes('w') || this.keys.includes('arrowup')) && (!this.keys.includes('s') && !this.keys.includes('arrowdown'))) this.inputDirection.y = -1;
            else if((this.keys.includes('s') || this.keys.includes('arrowdown')) && (!this.keys.includes('w') && !this.keys.includes('arrowup'))) this.inputDirection.y = 1;
            else this.inputDirection.y = 0;
    
            //solves diagonal movement speed discrepancy
            if(this.inputDirection.x !== 0 && this.inputDirection.y !== 0){
                this.inputDirection.x *= Math.SQRT1_2;
                this.inputDirection.y *= Math.SQRT1_2;
            }
    
            //smooth input movement using lerp
            this.inputSmoothing.x = this.lerp(this.inputSmoothing.x, this.inputDirection.x, this.inputResponsiveness * secondsPassed);
            this.inputSmoothing.y = this.lerp(this.inputSmoothing.y, this.inputDirection.y, this.inputResponsiveness * secondsPassed);
            
            //lerp velocity to zero
            this.velocity.x = this.lerp(this.velocity.x, 0, this.inputResponsiveness * secondsPassed);
            this.velocity.y = this.lerp(this.velocity.y, 0, this.inputResponsiveness * secondsPassed);
            
            //combine velocity and input movement
            this.moveDirection.x = this.velocity.x + (this.inputSmoothing.x * this.moveSpeed);
            this.moveDirection.y = this.velocity.y + (this.inputSmoothing.y * this.moveSpeed);
            
            //move
            this.position.x += this.moveDirection.x * secondsPassed;
            this.position.y += this.moveDirection.y * secondsPassed;
        }

        //update sprite
        this.sprite.updateSprite(secondsPassed);

        //switch animaiton when stop and go
        if(Math.abs(this.moveDirection.x) < 25 && Math.abs(this.moveDirection.y) < 25)
        {
            if(this.sprite.currentRow != 1) this.sprite.currentFrame = 0;
            this.sprite.currentRow = 1;
            this.sprite.framesOnRow = 2;
            this.sprite.secPerFrame = 0.26;
        }
        else
        {
            if(this.sprite.currentRow != 2) this.sprite.currentFrame = 0;
            this.sprite.currentRow = 2;
            this.sprite.framesOnRow = 5;
            this.sprite.secPerFrame = 0.14;
        }
    }

    draw(context){
        //draw sprite
        context.save();
        context.translate(this.position.x, this.position.y);  //location on the canvas to draw your sprite, this is important.
        context.scale(this.moveDirection.x < 0 ? -1 : 1, 1);  //This does your mirroring/flipping
        this.sprite.drawSprite(context); //draw x/y is 0, position set on translate
        context.restore();

        //draw name
        context.fillStyle = "#fff";
        context.font = "20px Special Elite";
        context.textAlign = "center";
        context.fillText(
            this.id.length > 12 ? this.id.substring(0, 4).concat('...', this.id.substring(this.id.length - 3)) : this.id,
            this.position.x,
            this.position.y - 32);
    }

    lerp(start, end, t){
        return  (1 - t) * start + end * t;
    }
}