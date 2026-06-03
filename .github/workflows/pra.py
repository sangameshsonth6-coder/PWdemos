# def fact(n):
#     if n==0:
#         return 1
#     return(n*fact(n-1))

# print(fact(6))



# def numbers(i,n):
#     if i>n:
#         return
#     print(i,end=" ")
#     numbers(i+1,n)

# numbers(1,10)

# def fun (n):
#     if n==0:
#         return
#     print(n,end=" ")
#     fun(n-1)
# fun(10)


# i ="sangamesh"
# i = i[::-1]
# print(i)


# def fact(n):
#     if n==0:
#         return 1
#     return(n*fact(n-1))
# print(fact(4))


# x=121
# y=str(x)[::-1]
# print(y)
# if y==str(x):
#     print("palindrome")
# else:    
#     print("not palindrome")

# x=int(input("enter a number = "))
# y=int(input("enter a number = "))
# x,y=y,x
# print("x=",x)
# print("y=",y)


# x=123454321
# y=str(x)
# z=y[::-1]
# if z==y:
#     print("palindrome")
# else:
#     print("not palindrome")


# x=[1,2,3,2,2,3,4,5,6,7,8,9]
# y=set(x)
# print(y)
# print(list(y)[::-1])


# n=int(input("enter a numbers = "))
# a=0
# b=1
# print("febnonicci series")

# for i in range(n):
#     print(a,end=" ")
#     c=a+b
#     a=b
#     b=c



num=int(input("enter a number = "))
if num>1:
    for i in range(2,num):
        if num%i==0:
            print(num,"not a prime number")
        break
    else:
        print(num,"prime number")
else:
    print(num,"not a prime number")


num = int(input("Enter a number: "))

if num > 1:
    for i in range(2, num):
        if num % i == 0:
            print(num, "is not a Prime Number")
            break
    else:
        print(num, "is a Prime Number")
else:
    print(num, "is not a Prime Number")

