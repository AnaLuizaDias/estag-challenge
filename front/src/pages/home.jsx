import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";

const Home = () => {
  const [values, setValues] = useState([]);
  const [selectProduct, setSelectProduct] = useState({});
  const [amount, setAmount] = useState([]);
  const [tempCart, setTempCart] = useState([]);

  const [priceTax, setPriceTax] = useState({
    price: "",
    tax: "",
  });
  const [taxTotal, setTaxTotal] = useState({
    totaltax: "",
    total: "",
  });

  useEffect(() => {
    getProductsFromDb();
  }, []);

  useEffect(() => {
    viewTotal();
  }, [tempCart]);

  useEffect(() => {
    viewInput();
  }, [selectProduct.name, amount]);

  async function finishCompra() {
    if (tempCart.length > 0) {
      let formatedCart = tempCart.map((item) => {
        return { code: item.code, amount: item.amount };
      });
      await fetch("http://localhost/routes/orders.php", {
        method: "post",
        body: JSON.stringify(formatedCart),
      }).then((res) => res.json());
    }
    tempCart = [];
    window.location.reload();
  }

  async function getProductsFromDb() {
    fetch("http://localhost/routes/products.php")
      .then((data) => data.json())
      .then((value) => setValues(value));
  }

  const getAmount = (event) => {
    setAmount(parseFloat(event.target.value));
  };
  const getProduct = (event) => {
    const product = values.find((item) => item.name === event.target.value);

    setSelectProduct(product);
  };

  const viewInput = async () => {
    if (selectProduct.code) {
      const tax_value = parseFloat(selectProduct.tax);
      const price = parseFloat(selectProduct.price);
      const totalTax = (tax_value * price * amount) / 100;
      const totalPrice = price * amount;

      setPriceTax({
        price: totalPrice.toFixed(2),
        tax: totalTax.toFixed(2),
      });
    }
  };

  const viewTotal = async () => {
    let total = 0;
    let tax = 0;

    tempCart.forEach((compra) => {
      tax += parseFloat(compra.tax);
      total += parseFloat(compra.total);
    });

    setTaxTotal({
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    });
  };

  const addToCart = async (e) => {
    e.preventDefault();
    if (amount <= selectProduct.amount) {
      const tax_value = parseFloat(selectProduct.tax_unit * amount);
      const price = parseFloat(selectProduct.price * amount);
      const totalProd = tax_value + price;
      const compra = {
        code: selectProduct.code,
        name: selectProduct.name,
        price: selectProduct.price,
        tax: tax_value,
        amount: amount,
        total: totalProd,
      };
      let exist = tempCart.find((obj) => obj.name == selectProduct.name);
      if (exist) {
      } else {
        setTempCart((prev) => [...prev, compra]);
      }
    }
  };

  function existItem() {
    let exist = tempCart.find((obj) => obj.name == selectProduct.name);
    if (exist.amount < selectProduct.amount) {
      console.log(priceTax);
      if (exist) {
        exist.amount = parseInt(exist.amount) + parseInt(amount);
        const tax = parseFloat(priceTax.tax);
        exist.tax += tax;
        const price = parseFloat(priceTax.price);
        exist.total += tax + price;

        viewInput();
        viewTotal();
        return;
      } else {
        addToCart();
      }
    }
  }

  function deleteCart() {
    const response = window.confirm("deseja realmente cancelar a compra?");
    if (response) {
      window.location.reload();
    }
  }
  const deleteItem = async (id) => {
    const newtempCart = tempCart.filter((item) => item.code !== id);
    setTempCart(newtempCart);
  };

  return (
    <>
      <div className="conteiner col-12">
        <div className="col-5">
          <Form onSubmit={addToCart}>
            <Form.Select
              id="selectProduct"
              value={selectProduct.name}
              className="mb-3 select"
              onChange={getProduct}
            >
              <option readOnly>Product</option>
              {values.map((select, item) => (
                <option value={select.name} key={item}>
                  {select.name}
                </option>
              ))}
            </Form.Select>

            <Form.Group className="mb-3">
              <Form.Control
                value={amount}
                type="number"
                min="1"
                placeholder="Amount"
                onChange={getAmount}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                value={priceTax.tax}
                type="number"
                min="1"
                placeholder="Tax"
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                value={priceTax.price}
                type="number"
                min="1"
                placeholder="Price"
                readOnly
              />
            </Form.Group>

            <Button
              variant="light"
              type="submit"
              className="mt-4 purple"
              onClick={() => existItem(selectProduct.code)}
            >
              Add Product
            </Button>
          </Form>
        </div>

        <div className=" col-5">
          <Table responsive="sm">
            <thead>
              <tr>
                <th>Product</th>
                <th>Unit Price</th>
                <th>Amount</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {tempCart.map((compra) => (
                <tr key={compra.code}>
                  <td>{compra.name}</td>
                  <td>{compra.price}</td>
                  <td>{compra.amount}</td>
                  <td>{compra.total}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => deleteItem(compra.code)}
                      className="gbt ml"
                    >
                      delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="inputHome col-6">
            <Form onSubmit={finishCompra}>
              <Form.Group className="mb-3 mt-5 ml readonly">
                <Form.Control
                  type="number"
                  placeholder="Tax"
                  value={taxTotal.tax}
                  readOnly
                />
              </Form.Group>
              <Form.Group className="mb-3 ml mt-3 readonly">
                <Form.Control
                  type="text"
                  placeholder="Total"
                  value={taxTotal.total}
                  readOnly
                />
              </Form.Group>

              <Button
                variant="light"
                type="button"
                className="mt-4 gbt ml"
                onClick={deleteCart}
              >
                Cancel
              </Button>
              <Button variant="light" type="submit" className="mt-4 ml purple">
                Finish
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
