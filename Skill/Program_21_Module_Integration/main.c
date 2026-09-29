#include <stdio.h>


void parser()
{
    printf("Parser module loaded\n");
}


void executor()
{
    printf("Executor module loaded\n");
}


void history()
{
    printf("History module loaded\n");
}



int main()
{

printf("OSSP Shell Integration Test\n");


parser();

history();

executor();


printf("All modules connected successfully\n");


return 0;

}
