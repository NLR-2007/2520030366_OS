#include <stdio.h>
#include <stdlib.h>


int main()
{

char *memory;


memory = malloc(100);


if(memory)
{
printf("Memory allocated\n");
}




free(memory);


printf("Memory released\n");


return 0;

}
