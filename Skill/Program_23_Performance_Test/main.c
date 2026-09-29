#include <stdio.h>
#include <time.h>


int main()
{

clock_t start,end;


start=clock();



for(int i=0;i<1000000;i++)
{

}



end=clock();



double time_taken;


time_taken=(double)(end-start)/CLOCKS_PER_SEC;



printf("Execution time: %lf seconds\n",
time_taken);



return 0;

}
