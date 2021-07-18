use clap::Clap;
use std::io::ErrorKind::NotFound;
use std::{path::PathBuf, process::Command};

// curl -X POST -F upload=@database/funny-hqw.jpeg http://127.0.0.1:8080

#[derive(Clap, Debug)]
struct Opts {
    #[clap(short, long, default_value = "https://i.zephyr/")]
    url: String,
    store: String,
    files: Vec<PathBuf>,
}

fn main() {
    let opts = Opts::parse();

    for file in opts.files {
        match Command::new("curl")
            .args(&[
                "-X",
                "POST",
                "-F",
                &format!("upload=@{}", file.display()),
                &format!("{}{}", opts.url, opts.store),
            ])
            .output()
        {
            Ok(output) => {
                println!("Upload Status: {}", output.status);
                println!("File Data: {}", String::from_utf8_lossy(&output.stdout));
            }
            Err(err) => {
                if let NotFound = err.kind() {
                    eprintln!("Could not find curl, please install");
                } else {
                    eprintln!("{:?}", err.kind())
                }
            }
        };
    }
}
