class RootController < Application
  get '/' do
    flash_info "Thanks for nothing"
    slim :'index'
  end
end
