(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.querySelector('form');
        const convertButton = form.querySelector('button');
        const uploadButton = form.querySelector('label[for="image_uploads"]');
        const input = form.querySelector('input#image_uploads');
        const preview = document.querySelector('.preview');
        const fileTypes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png'
        ];

        let processing = false;

        const validFileType = file => {
            for (let i = 0; i < fileTypes.length; i++) {
                if (file.type === fileTypes[i]) {
                    return true;
                }
            }

            return false;
        };

        const returnFileSize = number => {
            if (number < 1024) {
                return number + 'bytes';
            } else if (number >= 1024 && number < 1048576) {
                return (number / 1024).toFixed(1) + 'KB';
            } else if (number >= 1048576) {
                return (number / 1048576).toFixed(1) + 'MB';
            }
        };

        const updateImageDisplay = () => {
            if (processing) {
                return;
            }

            processing = true;

            uploadButton.classList.remove('active');

            while (preview.firstChild) {
                preview.removeChild(preview.firstChild);
            }

            const curFiles = input.files;

            console.log(curFiles);

            if (curFiles.length === 0) {
                let para = document.createElement('p');

                para.textContent = 'No files currently selected for upload';

                preview.appendChild(para);
                convertButton.setAttribute('disabled', true);
            } else {
                const list = document.createElement('ol');

                preview.appendChild(list);

                for (let i = 0; i < curFiles.length; i++) {
                    const listItem = document.createElement('li');

                    let para = document.createElement('p');

                    if (validFileType(curFiles[i])) {
                        para.textContent = 'File name "' + curFiles[i].name + '", file size ' + returnFileSize(curFiles[i].size) + '.';

                        const image = document.createElement('img');

                        image.src = window.URL.createObjectURL(curFiles[i]);
                        image.height = 64;

                        listItem.appendChild(image);
                        listItem.appendChild(para);

                    } else {
                        para.textContent = 'File name ' + curFiles[i].name + ': Not a valid file type. Update your selection.';

                        listItem.appendChild(para);
                    }

                    list.appendChild(listItem);
                    convertButton.removeAttribute('disabled');
                }
            }

            processing = false;
        };

        input.addEventListener('click', () => {
            input.value = '';

            uploadButton.classList.add('active');

            document.body.onfocus = () => {
                setTimeout(() => {
                    updateImageDisplay();

                    document.body.onfocus = null;
                }, 100);
            };
        });

        input.addEventListener('change', updateImageDisplay);

        convertButton.addEventListener('click', function (event) {
            event.preventDefault();

            if (processing) {
                return;
            }

            processing = true;

            convertButton.classList.add('active');
            uploadButton.setAttribute('disabled', true);

            const formData = new FormData(form);

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(response => {
                    const status = response.status;
                    const message = response.message;
                    const code = response.code;
                    const token = message;

                    if (status === 'successful') {
                        fetch('/check/' + token, {method: 'POST'})
                            .then(response => response.json())
                            .then(response => {
                                const status = response.status;
                                const message = response.message;
                                const code = response.code;

                                if (status === 'successful') {
                                    window.location.pathname = message;
                                } else {
                                    if (code === 'something_got_wrong') {
                                        fetch('/check/' + token, {method: 'POST'})
                                            .then(response => response.json())
                                            .then(response => {
                                                const status = response.status;
                                                const message = response.message;
                                                const code = response.code;

                                                if (status === 'successful') {
                                                    window.location.pathname = message;
                                                } else {
                                                    console.error(response)
                                                }
                                            })
                                            .catch(error => console.error('Error:', error));
                                    } else {
                                        console.error(response)
                                    }
                                }
                            }).catch(error => console.error(error));
                    } else {
                        console.error(response);
                    }
                }).catch(error => console.error(error));
        })
    });
})();
