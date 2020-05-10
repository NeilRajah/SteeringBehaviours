from math import sqrt
import random

def magsq(a):
    return a[0] * a[0] + a[1] * a[1]

def mag(a):
    return sqrt(magsq(a))

def dist(a, b):
    return mag([b[0]-a[0], b[1]-a[1]])

def distsq(a, b):
    return magsq([b[0]-a[0], b[1]-a[1]])

def fuzzEq(m, n, eps):
    return abs(m-n) < eps

def rand(n):
    return [n * random.random(), n * random.random()]

def between(a, b):
    return [avg(a[0],b[0]), avg(a[1],b[1])]

def avg(m, n):
    return (m + n)/2

fails = []
# for i in range(30):
# a = rand(15)
# b = rand(15)
# p = between(a,b)

a = [177.5, 525.7798242724651]
b = [532.5, 573.0481501053613]
p = [474.8754992758705, 565.3754355245553]

print(a,b,p)

print(dist(a,b), dist(a,p), dist(b,p), dist(a,p) + dist(b,p))
print(fuzzEq(dist(a,b), dist(a,p) + dist(b,p), 0.01))

print(distsq(a,b), distsq(a,p), distsq(b,p))
print(fuzzEq(distsq(a,b), 2 * (distsq(a,p) + distsq(b,p)), 0.01))

# fails.append(fuzzEq(distsq(a,b), 2 * (distsq(a,p) + distsq(b,p)), 0.01))

# num = 0
# for fail in fails:
#     if not fail:
#         print(fail)
#     else:
#         num += 1

# if num == 30:
#     print("success!", num, 30)
# else: 
#     print("failure", num, 30)
    