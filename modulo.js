const { compileFunction } = require("vm");

module.exports=class{
    constructor(t){
      this.board=t.board;
      this.current=t.current;
      this.light=t.light;
      this.dark=t.dark;
      this.empty=t.empty;
    }
    play(row,column){
       
        let mudou = -1;
        let posii=[-1,1,0,0,-1,-1,1,1];
        let posij=[0,0,-1,1,-1,1,-1,1];
        let difdecurrent=0;
        for (let k=0;k<8;k++) {
            let p = this.check(row+posii[k],column+posij[k],posii[k],posij[k],difdecurrent);
            if(p!=-1 && difdecurrent!=0){
                this.change(row,column,posii[k],posij[k]);
                mudou=0;
            }
        }
        if(mudou==-1){ return JSON.stringify(({ "error": "nenhuma peça alterada"}));}
        else{this.empty--; return JSON.stringify(({}));}
    
    }
    
    check(row,column,i,j,difdecurrent){
        console.log(this.board[row][column]);
        if(row>7 || row<0 || column>7 || column<0){
            return -1;
        }
        else if((this.board[row][column]).toString()!="empty"){
            if((this.board[row][column]).toString()==this.current){
                // this.change(row,column,i,j);
                 return difdecurrent;
             }
             else{
                 return this.check(row+i,column+j,i,j,difdecurrent+1);
             }
            
        }
        return -1;

    }

    change(row,column,i,j){
        let cor=0;
        this.board[row][column]=(t.current=="dark"?"dark":"light");
        while(cor==0){
            if((this.board[row+i][column+j]).toString()!=this.current){
                this.light+=(this.current=="light"? 1 : 0);
                this.dark+=(this.current=="dark"? 1 : 0);
                this.board[row+i][column+j]=(this.current=="dark"?"dark":"light");
                
                row=row+i;
                column=column+j;
            }
            else{cor=1;}
        }

    }
   

}