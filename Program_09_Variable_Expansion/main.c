#include <stdio.h>
#include <stdlib.h>
#include <string.h>


int main()
{

char variable[50];


printf("Enter variable name: ");

scanf("%s",variable);


char *value=getenv(variable);


if(value)
{
printf("Value: %s\n",value);
}

else
{
printf("Variable not found\n");
}


return 0;

}
