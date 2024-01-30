(expect, response) => {
  expect(response.body.id).match(/\w+/i);
};
