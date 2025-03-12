export class Order {
  userId: string;
  userName: string;
  orderId: string;
  prodId: number;
  value: number;
  date: string;

  constructor(
    userId: string,
    userName: string,
    orderId: string,
    prodId: number,
    value: number,
    date: string,
  ) {
    this.userId = userId;
    this.userName = userName;
    this.orderId = orderId;
    this.prodId = prodId;
    this.value = value;
    this.date = date;
  }
}
