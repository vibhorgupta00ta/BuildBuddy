async function testUpload() {
  try {
    const formData = new FormData();
    formData.append('file', new Blob(['test data'], { type: 'text/plain' }), 'test.txt');

    const res = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Error:', data);
    } else {
      console.log('Success:', data);
    }
  } catch (error) {
    console.error('Network Error:', error.message);
  }
}

testUpload();
