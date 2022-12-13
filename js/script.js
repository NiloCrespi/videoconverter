import {
    Uppy,
    Dashboard,
    ImageEditor,
    RemoteSources,
    Transloadit,
} from 'https://releases.transloadit.com/uppy/v3.3.1/uppy.min.mjs'
  
const uppy = new Uppy()
    .use(Transloadit, {
        waitForEncoding: true,
        alwaysRunAssembly: true,
        template_id: '1c821d8722da46f0827f624d2e9facfb', 
        params: {
            // To avoid tampering use signatures:
            // https://transloadit.com/docs/api/#authentication
            auth: {
                key: '1b7591fbdc134566a48e88cc2d061262',
            },
            // It's often better store encoding instructions in your account
            // and use a `template_id` instead of adding these steps inline
            steps: {
                ':original': {
                    robot: '/upload/handle',
                },
                
                imported_image: {
                robot: '/http/import',
                url: 'https://demos.transloadit.com/inputs/chameleon.jpg',
                },
            
                resized_image: {
                    use: 'imported_image',
                    robot: '/image/resize',
                    result: true,
                    width: 1024,
                    height: 768,
                    zoom: false,
                    resize_strategy: 'fillcrop',
                    imagemagick_stack: 'v2.0.7',
                },
            
                merged: {
                    robot: '/video/merge',
                    use: {
                        steps: [
                            {
                            name: ':original',
                            as: 'audio',
                            }, 
                            {
                            name: 'resized_image',
                            as: 'image',
                            }, 
                        ],
                    },
                    result: true,
                    ffmpeg_stack: 'v4.3.1',
                    preset: 'ipad-high',
                },
                
                exported: {
                    use: [
                        "imported_image",
                        "resized_image",
                        "merged",
                        ":original"
                    ],
                robot: "/youtube/store",
                credentials: "my_youtube_credentials",
                title: "Some title",
                description: "Some description",
                category: "music",
                keywords: "testing, example",
                visibility: "public"
                },
            },
        }
    })
    .use(Dashboard, { trigger: '#browse' })
    .use(ImageEditor, { target: Dashboard })
    .use(RemoteSources, {
        companionUrl: 'https://api2.transloadit.com/companion',
    })
    .on('complete', ({ transloadit }) => {
        // Due to `waitForEncoding: true` this is fired after encoding is done.
        // Alternatively, set `waitForEncoding` to `false` and provide a `notify_url`
        console.log(transloadit) // Array of Assembly Statuses
        transloadit.forEach((assembly) => {
            console.log(assembly.results) // Array of all encoding results
        })
    })
    .on('error', (error) => {
        console.error(error)
    })