# Ouber Eats #

The Backend of Ouber Eats Clone

## User Model

[x] id
[x] createdAt
[x] updatedAt

---

[x] email
[x] password
[x] role(client|owner|delivery)

## User CRUD

[x] Create Account
[x] Log In
[x] See Profile
[x] Verify Email

## Retaurant Model

[x] name
[x] category
[x] address
[x] coverImage

## Restaurant CRUD

[x] See Categories
[x] See Restaurants by Category (pagination)
[x] See Restaurants (pagination)
[x] See Restaurant

[x] Edit Restaurant
[x] Delete Restaurant

[x] Create Dish
[x] Edit Dish
[x] Delete Dish

[X] Orders CREATE
[X] Orders READ
[X] Orders Update


- Orders Subscription:

  [X] Pending Orders (s: newOrder) (t: createOrder(newOrder))
  - Cancel request (Owner)
  - Cancel accepted (Customer) 
  [X] Order Status (Customer, Delivery, Owner) (sf: orderUpdate) (t: editOrder(orderUpdate))
  - Pending Pickup Order (Delivery) (s: orderUpdate) (t: editOrder(orderUpdate))


- Payments (Cron jobs)