require 'mysql2'
require 'slim'
require 'redis'
require 'sprockets'
require 'sinatra/base'
require 'sinatra/cookies'
require 'sinatra/content_for'
require "sinatra/logger"
require 'rack-flash'
require 'data_mapper'
require 'json'
require 'openssl'
require 'jwt'

class SDN < Sinatra::Base

  logger filename: "log/#{SDN.environment}.log", level: :trace

  enable :sessions, :logging
  use Rack::MethodOverride
  use Rack::Flash, :accessorize => [:info, :error, :success], :sweep => true
  # use Rack::Protection::AuthenticityToken # HTML forms now require: input name="authenticity_token" value=session[:csrf] type="hidden"
  set :public_folder, File.dirname(__FILE__) + '/assets'
  set :views, File.dirname(__FILE__) + '/views'
  # set :session_secret, "ce0ae1957b02b5b05261" # SecureRandom.hex(128)
  set :cookie_options, { path: '/'}

  Slim::Engine.set_options attr_list_delims: {'(' => ')', '[' => ']'}, code_attr_delims: {'(' => ')', '[' => ']'}

  def self.sprockets
    project_root = File.expand_path(File.dirname(__FILE__))
    assets = Sprockets::Environment.new(project_root)
    assets.append_path('assets/js')
    assets.append_path('assets/css')
    assets.append_path('assets/images')
    assets.append_path('assets/fonts')
    assets.append_path('assets/json')
    # Twitter Bootstrap...
    #assets.append_path('lib/bootstrap/js')
    #assets.append_path('lib/bootstrap/css')
    assets
  end

  helpers Sinatra::Cookies
  helpers Sinatra::ContentFor
  helpers do
    # protected just does a redirect if we don't have a valid token
    def protected!
      return if authorized?
      # redirect to('/login')
    end

    def extract_token
      # check for the access_token header
      token = request.env["access_token"]
      if token
        return token
      end

      # or the form parameter _access_token
      token = request["access_token"]
      if token
        return token
      end
      # or check the session for the access_token
      token = session["access_token"]
      if token
        return token
      end
      return nil
    end

    # check the token to make sure it is valid with our public key
    def authorized?
      @token = extract_token
      begin
        payload, header = JWT.decode(@token, nil, false)
        @exp = header["exp"]
        # check to see if the exp is set (we don't accept forever tokens)
        if @exp.nil?
          logger.debug "Access token doesn't have exp set"
          return false
        end
        @exp = Time.at(@exp.to_i)
        # make sure the token hasn't expired
        if Time.now > @exp
          logger.debug "Access token expired"
          return false
        end
        @user_id = payload["user_id"]
      rescue JWT::DecodeError => e
        logger.error e
        return false
      end
    end
  end

  configure :development do
    require "sinatra/reloader"
    register Sinatra::Reloader
    also_reload 'routes/**/*.rb'
    also_reload 'views/**/*.rb'
    also_reload 'lib/**/*.rb'
    also_reload 'config/**/*.rb'
    set :raise_errors, true
  end

  [:error, :info, :success].each do |key|
    class_eval "
    def flash_#{key}(key, now=true)
      message(key, :#{key}, now)
    end
    "
  end

  def message(key, type=:notice, now=true)
    hash = now ? flash.now : flash
    hash[type] = key
  end

  def meta(key, value = nil)
    value ? content_for(key) { value } : yield_content(key)
  end

  def content_tag(name, content, attributes = nil)
    name = html_escape(name) unless name.html_safe?
    content = html_escape(content) unless content.html_safe?
    attributes = attributes.map do |key, value|
      value = html_escape(value) unless value.html_safe?
      %Q{#{key}="#{value}"}
    end if attributes && attributes.any?
    start = [name, attributes.join(" ")].reject(&:nil?).join(' ')
    "<#{start}>#{content}</#{name}>"
  end

  def debug_something_with_pry
    Kernel.binding.pry
  end

  #error_logger = Logger.new('log/errors.log')

  error do
    #e = request.env['sinatra.error']
    #info = "Application error\n#{e}\n#{e.backtrace.join("\n")}"
    #error_logger.info info
    #Kernel.puts info

    slim :'errors/500'
  end

  not_found do
    redirect '/'
  end

end

#ActiveRecord::Base.send(:attr_accessible, nil)

# Move to config/init/db.rb if you like
OpenStruct.new(YAML::load(File.open('config/database.yml'))[SDN.environment.to_s].symbolize_keys).tap do |config|
  DataMapper::Logger.new($stdout, :debug)
  DataMapper.setup(
    :default,
    "mysql://#{config.username}:#{config.password}@#{config.host}/#{config.database}"
  )
  Dir[File.join('models', '**/*.rb')].each do |file| require_relative file end
end

$redis = Redis.new(:host => '127.0.0.1', :port => 6379)
#$redis = Redis.new(:host => '132.122.237.248', :port => 6378)
