export class GetInput{
    constructor(keys){
        this.keys = keys;

        window.addEventListener('keydown', e => {
            if((e.key.toLowerCase() === 'w' || 
                e.key.toLowerCase() === 'a' ||
                e.key.toLowerCase() === 's' ||
                e.key.toLowerCase() === 'd' ||
                e.key.toLowerCase() === 'arrowup' ||
                e.key.toLowerCase() === 'arrowleft' ||
                e.key.toLowerCase() === 'arrowright' ||
                e.key.toLowerCase() === 'arrowdown' 
                ) && this.keys.indexOf(e.key.toLowerCase()) === -1){
                this.keys.unshift(e.key.toLowerCase());
            }
        });
        window.addEventListener('keyup', e => {
            if(this.keys.indexOf(e.key.toLowerCase()) > -1){
                this.keys.splice(this.keys.indexOf(e.key.toLowerCase()), 1);
            }
        });
    }   
}