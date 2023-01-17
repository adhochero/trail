export class Gun{
    constructor(){
        this.singleFire = false;
        this.magazineSize = 12;
        this.bulletsLeft = this.magazineSize;
        this.burstFireAmount = this.magazineSize; //magazineSize for full auto
        this.bulletsShot = 0;
        this.bulletsPerShot = 1; //more for shutguns
        this.fireRate = 100;
        this.reloadTime = 1500;

        this.reloading = false;

        this.shootTimeout;
        this.reloadTimeout;
        
        window.addEventListener('mousedown', (e) =>{
            if (this.bulletsLeft > 0 &&
                !this.reloading){
                    this.bulletsShot = 0;
                    this.shoot();
                }
        });

        window.addEventListener('mouseup', (e) =>{
            clearTimeout(this.shootTimeout);

            if (this.bulletsLeft <= 0 &&
                !this.reloading){
                    this.reload();
                }
        });
    }

    shoot(){
        for (let i = 0; i < this.bulletsPerShot; i++ ){
            console.log('BANG!');
        }

        this.bulletsShot++;
        this.bulletsLeft--;

        if (!this.singleFire &&
            this.bulletsLeft > 0 &&
            this.bulletsShot < this.burstFireAmount){
                this.shootTimeout = setTimeout(() => this.shoot(), this.fireRate);  
            }
    }

    reload(){
        this.reloading = true;
        console.log('reloading...');
        this.reloadTimeout = setTimeout(() => this.reloadFinished(), this.reloadTime);
    }

    reloadFinished(){
        console.log('ready!!');
        this.bulletsLeft = this.magazineSize;
        this.reloading = false;
    }
}
