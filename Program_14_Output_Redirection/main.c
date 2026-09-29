#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>


int main()
{


int fd;


fd=open("output.txt",
O_WRONLY|O_CREAT|O_TRUNC,
0644);


dup2(fd,STDOUT_FILENO);


close(fd);



printf("Output redirected successfully\n");



return 0;

}
