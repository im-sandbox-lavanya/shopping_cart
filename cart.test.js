import { jest } from '@jest/globals';

function setupDom() {
  document.body.innerHTML = `
    <nav><span id="cart-count"></span></nav>
    <table>
      <tbody id="cart-body"></tbody>
      <tfoot><tr><td id="cart-total"></td></tr></tfoot>
    </table>
  `;
}

describe('cart module', () => {
  beforeEach(async () => {
    jest.resetModules();
    sessionStorage.clear();
    setupDom();
  });

  test('fmt() returns locale number strings', async () => {
    const mod = await import('./cart.js');
    expect(mod.fmt(1234.5)).toBe('1,234.50');
  });

  test('escHtml() escapes special characters', async () => {
    const mod = await import('./cart.js');
    expect(mod.escHtml('<a & "b">')).toBe('&lt;a &amp; &quot;b&quot;&gt;');
  });

  test('render() populates DOM and badge count', async () => {
    const mod = await import('./cart.js');
    mod.setCart([
      { id: 1, name: 'One', price: 10, qty: 2 },
      { id: 2, name: 'Two', price: 5, qty: 3 },
    ]);

    mod.render();

    expect(document.querySelectorAll('#cart-body tr')).toHaveLength(2);
    expect(document.getElementById('cart-total').textContent).toBe('35.00');
    expect(document.getElementById('cart-count').textContent).toBe('5');
  });

  test('item deletion updates cart array and rerenders', async () => {
    const mod = await import('./cart.js');
    mod.setCart([
      { id: 1, name: 'One', price: 10, qty: 2 },
      { id: 2, name: 'Two', price: 5, qty: 1 },
    ]);
    mod.render();

    const deleteBtn = document.querySelector('.delete-btn');
    deleteBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(mod.getCart()).toHaveLength(1);
    expect(document.querySelectorAll('#cart-body tr')).toHaveLength(1);
  });

  test('quantity change recalculates subtotal and total', async () => {
    const mod = await import('./cart.js');
    mod.setCart([{ id: 1, name: 'One', price: 10, qty: 2 }]);
    mod.render();

    const qtyInput = document.querySelector('.qty-input');
    qtyInput.value = '4';
    qtyInput.dispatchEvent(new Event('change', { bubbles: true }));

    expect(mod.getCart()[0].qty).toBe(4);
    expect(document.querySelector('.col-subtotal').textContent).toBe('40.00');
    expect(document.getElementById('cart-total').textContent).toBe('40.00');
  });

  test('clearCart() empties cart and rerenders table', async () => {
    const mod = await import('./cart.js');
    mod.setCart([{ id: 1, name: 'One', price: 10, qty: 2 }]);
    mod.render();

    mod.clearCart();

    expect(mod.getCart()).toEqual([]);
    expect(document.querySelectorAll('#cart-body tr')).toHaveLength(0);
    expect(document.getElementById('cart-total').textContent).toBe('0.00');
    expect(document.getElementById('cart-count').textContent).toBe('0');
  });

  test('persist()/restoreFromStorage round-trip works', async () => {
    const mod = await import('./cart.js');
    const sample = [{ id: 9, name: 'Stored', price: 12, qty: 3 }];
    mod.setCart(sample);

    mod.persist();
    mod.setCart([]);
    mod.restoreFromStorage();

    expect(mod.getCart()).toEqual(sample);
  });
});
